import React, { useState, useEffect, useMemo } from 'react';
import { TranslationStrings } from '../../../i18n/translations';
import { PublicReview, ReviewStats } from '../../../types';
import { FeaturedReview } from './FeaturedReview';
import { ReviewBoard } from './ReviewBoard';
import { ReviewForm } from './ReviewForm';
import { ReviewToolbar } from './ReviewToolbar';
import { ReviewList } from './ReviewList';

interface ReviewsSectionProps {
  t: TranslationStrings;
  initialReviews: PublicReview[];
  initialStats: ReviewStats | null;
  initialFeatured: PublicReview | null;
  whatsappNumber: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  t,
  initialReviews,
  initialStats,
  initialFeatured,
  whatsappNumber,
}) => {
  const [reviews, setReviews] = useState<PublicReview[]>(initialReviews);
  const [featured, setFeatured] = useState<PublicReview | null>(initialFeatured);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    setFeatured(initialFeatured);
  }, [initialFeatured]);

  const handleReviewSubmitted = (newReview: PublicReview) => {
    if (!newReview.status || newReview.status === 'approved') {
      setReviews((prev) => [newReview, ...prev]);
    }
  };

  // ACCURACY FIX: Never fall back to 5 for missing/invalid ratings. Only count valid 1-5 ratings.
  const stats: ReviewStats = useMemo(() => {
    if (initialStats && reviews.length === initialReviews.length) {
      return initialStats;
    }
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let verified = 0;
    let validCount = 0;
    const sources = new Set<string>();

    for (const r of reviews) {
      const rt = typeof r.rating === 'number' ? r.rating : parseInt(String(r.rating), 10);
      if (!isNaN(rt) && rt >= 1 && rt <= 5) {
        histogram[rt as keyof typeof histogram]++;
        sum += rt;
        validCount++;
      }
      if (r.verified) verified++;
      if (r.source) sources.add(r.source);
    }
    const total = validCount;
    const average = total === 0 ? 0 : Math.round((sum / total) * 10) / 10;
    return {
      total,
      average,
      verified,
      sources: sources.size || 1,
      histogram,
    };
  }, [reviews, initialStats, initialReviews.length]);

  // Synchronize SEO JSON-LD with real live stats
  useEffect(() => {
    const el = document.getElementById('structured-data-jsonld');
    if (el) {
      try {
        const json = JSON.parse(el.textContent || '{}');
        if (json.aggregateRating) {
          json.aggregateRating.ratingValue = String(stats.average);
          json.aggregateRating.reviewCount = String(stats.total);
          el.textContent = JSON.stringify(json, null, 2);
        }
      } catch {
        // ignore
      }
    }
  }, [stats]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (ratingFilter !== 'all' && String(r.rating) !== ratingFilter) return false;
        if (serviceFilter !== 'all' && r.service !== serviceFilter) return false;
        if (verifiedOnly && !r.verified) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [reviews, ratingFilter, serviceFilter, verifiedOnly, sortBy]);

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            {t.reviews_eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.reviews_h2}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            {t.reviews_lead}
          </p>
        </div>

        {/* Featured Review */}
        {featured && <FeaturedReview review={featured} t={t} />}

        {/* Review Score Board & Histogram */}
        <ReviewBoard stats={stats} t={t} />

        {/* Add Review Form (Localized) */}
        <ReviewForm
          t={t}
          onReviewSubmitted={handleReviewSubmitted}
          whatsappNumber={whatsappNumber}
        />

        {/* Toolbar (Filters & Sort) */}
        <ReviewToolbar
          t={t}
          ratingFilter={ratingFilter}
          onRatingFilterChange={setRatingFilter}
          serviceFilter={serviceFilter}
          onServiceFilterChange={setServiceFilter}
          verifiedOnly={verifiedOnly}
          onVerifiedOnlyChange={setVerifiedOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Review Cards Grid */}
        <ReviewList
          t={t}
          reviews={filteredReviews}
          visibleCount={visibleCount}
          onLoadMore={() => setVisibleCount((prev) => prev + 6)}
        />
      </div>
    </section>
  );
};
