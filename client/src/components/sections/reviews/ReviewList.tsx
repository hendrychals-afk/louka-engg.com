import React, { useState } from 'react';
import { PublicReview } from '../../../types';
import { TranslationStrings } from '../../../i18n/translations';
import { StarRating } from '../../common/StarRating';

interface ReviewListProps {
  t: TranslationStrings;
  reviews: PublicReview[];
  visibleCount: number;
  onLoadMore: () => void;
}

function formatLocalizedTime(dateString: string, t: TranslationStrings): string {
  try {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return t.time_just_now;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return t.time_minutes_ago.replace('{count}', String(diffMin));
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return t.time_hours_ago.replace('{count}', String(diffHours));
    const diffDays = Math.floor(diffHours / 24);
    return t.time_days_ago.replace('{count}', String(diffDays));
  } catch {
    return t.time_just_now;
  }
}

export const ReviewList: React.FC<ReviewListProps> = ({ t, reviews, visibleCount, onLoadMore }) => {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const displayedReviews = reviews.slice(0, visibleCount);
  const remaining = reviews.length - displayedReviews.length;

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 shadow-sm">
        <p className="text-base font-bold text-slate-700">{t.no_reviews_match}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedReviews.map((r) => (
          <article
            key={r.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <StarRating value={r.rating} size="sm" />
                <div className="flex items-center gap-1.5">
                  {r.verified && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      ✓ {t.verified_label}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {r.source || 'Website'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal mb-4">
                "{r.text}"
              </p>

              {/* Optional Attached Photo */}
              {r.photo && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setActivePhoto(r.photo)}
                    className="block w-full rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity focus:outline-none shadow-sm cursor-pointer"
                  >
                    <img
                      src={r.photo}
                      alt={`Project photo by ${r.name}`}
                      className="w-full h-36 object-cover"
                      loading="lazy"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Author Footer */}
            <div className="border-t border-slate-100 pt-3.5 mt-3 flex items-center justify-between text-xs">
              <div>
                <strong className="block font-black text-slate-900 text-sm">{r.name}</strong>
                <span className="text-slate-500 font-medium">
                  {r.role} {r.company ? `· ${r.company}` : ''}
                </span>
                <span className="block text-[11px] text-blue-600 font-bold mt-0.5">
                  {r.service}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap pl-2">
                {formatLocalizedTime(r.createdAt, t)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Show more button */}
      {remaining > 0 && (
        <div className="text-center mt-12">
          <button
            onClick={onLoadMore}
            className="bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl border-2 border-blue-200 shadow-sm transition-all hover:border-blue-500 cursor-pointer"
          >
            {t.load_more} ({remaining} {t.remaining_text})
          </button>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-black shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 text-white bg-black/70 hover:bg-black rounded-full w-9 h-9 flex items-center justify-center text-lg font-black transition-colors"
            >
              ✕
            </button>
            <img src={activePhoto} alt="Review attachment full view" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </>
  );
};
