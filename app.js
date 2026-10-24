/**
 * Louka Engineering Review System & Website
 * Production Entry Point for GoDaddy cPanel (Phusion Passenger)
 */
'use strict';

const path = require('path');
const fs = require('fs');

// 1. Force working directory to the application root folder
try {
  process.chdir(__dirname);
} catch (err) {
  console.error('[CRITICAL] Failed to set working directory to app root:', err);
}

// 2. Load .env explicitly from application root before importing modules
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  try {
    require('dotenv').config({ path: envFile });
  } catch (err) {
    console.warn('[WARNING] Failed to parse .env file:', err);
  }
}

// 3. Ensure NODE_ENV is production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// 4. Capture and log uncaught exceptions with full stack trace for Passenger logs
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL STARTUP ERROR] Uncaught Exception:', err);
  if (err && err.stack) {
    console.error(err.stack);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// 5. Boot the compiled Express backend
let serverModule;
try {
  serverModule = require('./dist/server.js');
} catch (err) {
  console.error('[CRITICAL] Failed to load ./dist/server.js:', err);
  throw err;
}

const app = serverModule.app || serverModule;

// 6. Explicitly handle Phusion Passenger if detected
if (typeof PhusionPassenger !== 'undefined') {
  app.listen('passenger');
}

app.app = app;
module.exports = app;
