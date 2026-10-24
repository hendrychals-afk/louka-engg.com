export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type AllowedService =
  | 'Stud Fixing'
  | 'Deck Sheet Stud Fixing'
  | 'Coil Stud Fixing'
  | 'Deck Sheet Laying'
  | 'Reinforcement'
  | 'Roofing'
  | 'ROB & FOB'
  | 'Other';

export interface StoredReview {
  id: string;
  name: string;
  role: string;
  company: string;
  service: string;
  email?: string;
  rating: number;
  text: string;
  source: string;
  verified: boolean;
  status: ReviewStatus;
  featured: boolean;
  photo: string | null;
  createdAt: string;
  approvedAt: string | null;
  submittedIp?: string;
}

export interface ReviewStoreMeta {
  lastUpdated: string;
}

export interface ReviewStoreData {
  reviews: StoredReview[];
  meta: ReviewStoreMeta;
}

export interface PublicReview {
  id: string;
  name: string;
  role: string;
  company: string;
  service: string;
  rating: number;
  text: string;
  source: string;
  verified: boolean;
  featured: boolean;
  photo: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface RatingHistogram {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewStats {
  total: number;
  average: number;
  verified: number;
  sources: number;
  histogram: RatingHistogram;
}

export interface PublicReviewsResponse {
  reviews: PublicReview[];
  stats: ReviewStats;
  featured: PublicReview | null;
  whatsappNumber: string;
  reviewsPerPage: number;
}

export interface AdminReviewSummary {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface StoredInquiry extends ContactSubmission {
  id: string;
  createdAt: string;
  ip: string;
  status: 'new' | 'contacted' | 'archived';
}
