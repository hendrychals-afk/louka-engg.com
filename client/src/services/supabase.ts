import { createClient } from '@supabase/supabase-js';
import {
  PublicReview,
  PublicReviewsResponse,
  ReviewStats,
  RatingHistogram,
  AdminReview,
  AdminReviewSummary,
} from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qxdoenktuiqdlwieubrl.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZG9lbmt0dWlxZGx3aWV1YnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDkzMzAsImV4cCI6MjEwODQyNTMzMH0.c0chV7VtOIK1oJ5Pa7tskb7QD0O7MkpnSrkJcPS_tXs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const WHATSAPP_NUMBER = '918667556619';

/**
 * Calculates review stats and 5-star histogram from an array of approved reviews
 */
export function calculateStats(reviews: PublicReview[]): ReviewStats {
  const histogram: RatingHistogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let verifiedCount = 0;
  const sourcesSet = new Set<string>();

  for (const r of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
    histogram[rating] = (histogram[rating] || 0) + 1;
    sum += rating;
    if (r.verified) verifiedCount++;
    if (r.source) sourcesSet.add(r.source);
  }

  const total = reviews.length;
  const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 5.0;

  return {
    total,
    average,
    verified: verifiedCount,
    sources: sourcesSet.size || 1,
    histogram,
  };
}

/**
 * Fetches all approved reviews and calculates stats
 */
export async function fetchPublicReviews(): Promise<PublicReviewsResponse> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Error] Failed to fetch reviews:', error);
    throw new Error(error.message);
  }

  const reviews: PublicReview[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role || '',
    company: row.company || '',
    service: row.service || 'Other',
    rating: Number(row.rating) || 5,
    text: row.text,
    source: row.source || 'Website',
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    photo: row.photo_url || null,
    createdAt: row.created_at,
    approvedAt: row.approved_at || row.created_at,
    status: row.status,
  }));

  const stats = calculateStats(reviews);
  const featured = reviews.find((r) => r.featured) || null;

  return {
    reviews,
    stats,
    featured,
    whatsappNumber: WHATSAPP_NUMBER,
    reviewsPerPage: 6,
  };
}

/**
 * Submits a new customer review (held in 'pending' status for moderation)
 */
export async function submitPublicReview(params: {
  name: string;
  role: string;
  company?: string;
  service?: string;
  rating: number;
  text: string;
  photo?: File | null;
  website?: string; // honeypot
}): Promise<{ success: boolean; message: string }> {
  // 1. Anti-spam honeypot validation
  if (params.website && params.website.trim().length > 0) {
    return { success: true, message: 'Thank you! Your review has been submitted for moderation.' };
  }

  let photoUrl: string | null = null;

  // 2. Upload photo if attached
  if (params.photo) {
    try {
      const ext = params.photo.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, params.photo, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('review-photos')
          .getPublicUrl(uploadData.path);
        photoUrl = publicUrlData?.publicUrl || null;
      }
    } catch (e) {
      console.warn('Photo upload skipped or failed:', e);
    }
  }

  // 3. Insert review into database (RLS ensures status is 'pending')
  const { error } = await supabase.from('reviews').insert([
    {
      name: params.name.trim(),
      role: params.role.trim(),
      company: (params.company || '').trim(),
      service: (params.service || 'Stud Fixing').trim(),
      rating: Math.min(5, Math.max(1, params.rating)),
      text: params.text.trim(),
      source: 'Website',
      status: 'pending',
      verified: false,
      featured: false,
      photo_url: photoUrl,
    },
  ]);

  if (error) {
    console.error('[Supabase Error] Review insert failed:', error);
    throw new Error(error.message || 'Could not submit review. Please try again.');
  }

  return {
    success: true,
    message: 'Thank you! Your review has been submitted for moderation and will appear once approved.',
  };
}

/**
 * Submits a contact inquiry to Supabase
 */
export async function submitContactInquiry(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
  website?: string;
}): Promise<{ success: boolean; message: string }> {
  if (params.website && params.website.trim().length > 0) {
    return { success: true, message: "Thanks — your message has been sent. We'll be in touch soon." };
  }

  const { error } = await supabase.from('inquiries').insert([
    {
      name: params.name.trim(),
      email: params.email.trim(),
      phone: params.phone.trim(),
      message: params.message.trim(),
      status: 'new',
    },
  ]);

  if (error) {
    console.error('[Supabase Error] Inquiry insert failed:', error);
    throw new Error(error.message || 'Could not submit message. Please try again.');
  }

  return {
    success: true,
    message: "Thanks — your message has been sent. We'll be in touch soon.",
  };
}

// =============================================================================
// ADMIN FUNCTIONS (SUPABASE AUTH & MODERATION)
// =============================================================================

export async function adminSignIn(email: string, password: string): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Invalid admin credentials.');
  }

  return data.session?.access_token || 'authenticated';
}

export async function adminSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function checkAdminSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

export async function fetchAdminReviews(): Promise<{
  reviews: AdminReview[];
  counts: AdminReviewSummary;
}> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch admin reviews.');
  }

  const counts: AdminReviewSummary = { pending: 0, approved: 0, rejected: 0 };
  const reviews: AdminReview[] = (data || []).map((row: any) => {
    const status = (row.status || 'pending') as 'pending' | 'approved' | 'rejected';
    if (counts[status] !== undefined) counts[status]++;

    return {
      id: row.id,
      name: row.name,
      role: row.role || '',
      company: row.company || '',
      service: row.service || 'Other',
      rating: Number(row.rating) || 5,
      text: row.text,
      source: row.source || 'Website',
      verified: Boolean(row.verified),
      featured: Boolean(row.featured),
      photo: row.photo_url || null,
      createdAt: row.created_at,
      approvedAt: row.approved_at || null,
      status,
      email: row.email || '',
    };
  });

  return { reviews, counts };
}

export async function executeAdminAction(
  action: string,
  id: string,
  payload?: any
): Promise<void> {
  if (action === 'approve') {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } else if (action === 'reject') {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (error) throw error;
  } else if (action === 'feature') {
    const { error } = await supabase
      .from('reviews')
      .update({ featured: Boolean(payload?.featured) })
      .eq('id', id);
    if (error) throw error;
  } else if (action === 'toggle_verified') {
    const { error } = await supabase
      .from('reviews')
      .update({ verified: Boolean(payload?.verified) })
      .eq('id', id);
    if (error) throw error;
  } else if (action === 'remove_photo') {
    const { error } = await supabase
      .from('reviews')
      .update({ photo_url: null })
      .eq('id', id);
    if (error) throw error;
  } else if (action === 'delete') {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  } else if (action === 'save') {
    const { error } = await supabase
      .from('reviews')
      .update({
        name: payload.name,
        role: payload.role,
        company: payload.company,
        service: payload.service,
        source: payload.source,
        rating: payload.rating,
        status: payload.status,
        verified: payload.verified,
        text: payload.text,
      })
      .eq('id', id);
    if (error) throw error;
  }
}
