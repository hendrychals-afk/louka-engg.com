import { describe, it, expect } from 'vitest';
import { StoreService } from '../src/services/store.service';
import { StoredReview } from '../src/types';

describe('StoreService', () => {
  const storeService = StoreService.getInstance();

  it('computes accurate review statistics and histogram', () => {
    const mockReviews: StoredReview[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'Engineer',
        company: 'A Corp',
        service: 'Stud Fixing',
        rating: 5,
        text: 'Great work',
        source: 'Google',
        verified: true,
        status: 'approved',
        featured: false,
        photo: null,
        createdAt: '2025-01-01T00:00:00Z',
        approvedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Bob',
        role: 'Manager',
        company: 'B Corp',
        service: 'Roofing',
        rating: 4,
        text: 'Good job',
        source: 'Website',
        verified: false,
        status: 'approved',
        featured: true,
        photo: null,
        createdAt: '2025-01-02T00:00:00Z',
        approvedAt: '2025-01-02T00:00:00Z',
      },
      {
        id: '3',
        name: 'Charlie',
        role: 'Architect',
        company: 'C Corp',
        service: 'Reinforcement',
        rating: 5,
        text: 'Excellent',
        source: 'Referral',
        verified: true,
        status: 'approved',
        featured: false,
        photo: null,
        createdAt: '2025-01-03T00:00:00Z',
        approvedAt: '2025-01-03T00:00:00Z',
      },
    ];

    const stats = storeService.computeStats(mockReviews);
    expect(stats.total).toBe(3);
    // (5 + 4 + 5) / 3 = 4.666... -> 4.7
    expect(stats.average).toBe(4.7);
    expect(stats.verified).toBe(2);
    expect(stats.sources).toBe(3);
    expect(stats.histogram[5]).toBe(2);
    expect(stats.histogram[4]).toBe(1);
    expect(stats.histogram[3]).toBe(0);
    expect(stats.histogram[2]).toBe(0);
    expect(stats.histogram[1]).toBe(0);
  });

  it('finds featured review correctly', () => {
    const mockReviews: StoredReview[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'Engineer',
        company: 'A Corp',
        service: 'Stud Fixing',
        rating: 5,
        text: 'Great work',
        source: 'Google',
        verified: true,
        status: 'approved',
        featured: false,
        photo: null,
        createdAt: '2025-01-01T00:00:00Z',
        approvedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Bob',
        role: 'Manager',
        company: 'B Corp',
        service: 'Roofing',
        rating: 5,
        text: 'Featured one',
        source: 'Website',
        verified: true,
        status: 'approved',
        featured: true,
        photo: null,
        createdAt: '2025-01-02T00:00:00Z',
        approvedAt: '2025-01-02T00:00:00Z',
      },
    ];

    const featured = storeService.findFeatured(mockReviews);
    expect(featured).not.toBeNull();
    expect(featured?.id).toBe('2');
    expect(featured?.name).toBe('Bob');
  });

  it('generates a 16-hex char random ID', () => {
    const id = storeService.generateId();
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });
});
