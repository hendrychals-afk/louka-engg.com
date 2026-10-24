import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from '../config';

interface AdminSession {
  lastActivity: number;
  csrfToken: string;
}

export class AuthService {
  private static instance: AuthService;
  private sessions = new Map<string, AdminSession>();

  private constructor() {
    this.loadSessions();
    // Periodically clean expired sessions every 10 minutes
    setInterval(() => this.cleanExpiredSessions(), 10 * 60 * 1000).unref();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadSessions(): void {
    if (fs.existsSync(config.sessionsFile)) {
      try {
        const raw = fs.readFileSync(config.sessionsFile, 'utf8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          for (const [id, s] of Object.entries(data)) {
            this.sessions.set(id, s as AdminSession);
          }
        }
      } catch {
        this.sessions.clear();
      }
    }
  }

  private persistSessions(): void {
    try {
      const obj: Record<string, AdminSession> = {};
      for (const [id, s] of this.sessions.entries()) {
        obj[id] = s;
      }
      const tempFile = path.join(config.dataDir, `.sessions.${crypto.randomUUID()}.tmp`);
      fs.writeFileSync(tempFile, JSON.stringify(obj, null, 2), 'utf8');
      fs.renameSync(tempFile, config.sessionsFile);
    } catch (err) {
      console.error('Failed to persist admin sessions:', err);
    }
  }

  public async verifyPassword(inputPassword: string): Promise<boolean> {
    if (!inputPassword) return false;

    // 1. If adminPasswordHash is set, check using bcrypt
    if (config.adminPasswordHash) {
      try {
        if (config.adminPasswordHash.startsWith('$2')) {
          return await bcrypt.compare(inputPassword, config.adminPasswordHash);
        }
        // Legacy fallback if hash is SHA-256
        const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
        const targetHash = config.adminPasswordHash.toLowerCase();
        if (inputHash.length !== targetHash.length) return false;
        return crypto.timingSafeEqual(Buffer.from(inputHash, 'utf8'), Buffer.from(targetHash, 'utf8'));
      } catch (err) {
        console.error('Password hash comparison error:', err);
        return false;
      }
    }

    // 2. If plaintext adminPassword configured
    if (config.adminPassword) {
      const inputBuffer = Buffer.from(inputPassword, 'utf8');
      const expectedBuffer = Buffer.from(config.adminPassword, 'utf8');
      if (inputBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
    }

    return false;
  }

  public createSession(): { sessionId: string; csrfToken: string } {
    const rawSessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Sign the session ID with server secret
    const signature = crypto.createHmac('sha256', config.sessionSecret).update(rawSessionId).digest('hex');
    const sessionId = `${rawSessionId}.${signature}`;

    this.sessions.set(sessionId, {
      lastActivity: Date.now(),
      csrfToken,
    });

    this.persistSessions();
    return { sessionId, csrfToken };
  }

  public validateSession(sessionId: string | undefined): { valid: boolean; session?: AdminSession } {
    if (!sessionId || !this.sessions.has(sessionId)) {
      return { valid: false };
    }

    // Verify HMAC signature
    const parts = sessionId.split('.');
    if (parts.length !== 2) {
      this.sessions.delete(sessionId);
      return { valid: false };
    }

    const [rawId, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', config.sessionSecret).update(rawId).digest('hex');
    if (sig !== expectedSig) {
      this.sessions.delete(sessionId);
      return { valid: false };
    }

    const session = this.sessions.get(sessionId)!;
    const now = Date.now();
    const maxInactiveMs = config.adminSessionLifetimeSeconds * 1000;

    if (now - session.lastActivity > maxInactiveMs) {
      this.sessions.delete(sessionId);
      this.persistSessions();
      return { valid: false };
    }

    // Sliding window renewal
    session.lastActivity = now;
    return { valid: true, session };
  }

  public destroySession(sessionId: string): void {
    if (sessionId && this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.persistSessions();
    }
  }

  public cleanExpiredSessions(): void {
    const now = Date.now();
    const maxInactiveMs = config.adminSessionLifetimeSeconds * 1000;
    let changed = false;

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxInactiveMs) {
        this.sessions.delete(id);
        changed = true;
      }
    }

    if (changed) {
      this.persistSessions();
    }
  }
}
