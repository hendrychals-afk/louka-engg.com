import React from 'react';
import { PublicReview } from '../../../types';
import { TranslationStrings } from '../../../i18n/translations';
import { StarRating } from '../../common/StarRating';

interface FeaturedReviewProps {
  review: PublicReview;
  t?: TranslationStrings;
}

export const FeaturedReview: React.FC<FeaturedReviewProps> = ({ review, t }) => {
  return (
    <article className="mb-10 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-700/50">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="text-xs font-black tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full">
          {t?.featured_label || 'Featured Review'}
        </span>
        {review.verified && (
          <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            ✓ {t?.verified_label || 'Verified Customer'}
          </span>
        )}
      </div>

      <div className="mb-3">
        <StarRating value={review.rating} size="sm" />
      </div>

      <p className="text-lg sm:text-xl font-medium italic text-slate-100 leading-relaxed mb-6">
        "{review.text}"
      </p>

      <div className="flex flex-wrap items-center justify-between border-t border-blue-800/60 pt-4 gap-2">
        <div>
          <h4 className="font-bold text-white text-base">{review.name}</h4>
          <p className="text-xs text-blue-200">
            {review.role} {review.company ? `· ${review.company}` : ''} · {review.service}
          </p>
        </div>
        <span className="text-xs text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-md border border-blue-700/50 font-medium">
          Source: {review.source || 'Website'}
        </span>
      </div>
    </article>
  );
};
