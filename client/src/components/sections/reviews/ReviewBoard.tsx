import React from 'react';
import { ReviewStats } from '../../../types';
import { TranslationStrings } from '../../../i18n/translations';
import { StarRating } from '../../common/StarRating';

interface ReviewBoardProps {
  stats: ReviewStats;
  t: TranslationStrings;
}

export const ReviewBoard: React.FC<ReviewBoardProps> = ({ stats, t }) => {
  const total = stats.total || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
      {/* Score and Histogram Card */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="text-center sm:text-left flex-shrink-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {t.overall_rating_title}
          </p>
          <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
            {stats.average.toFixed(1)}
          </div>
          <div className="mt-2.5">
            <StarRating value={Math.round(stats.average)} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-2.5 font-semibold">
            {t.based_on_reviews.replace('{count}', String(stats.total))}
          </p>
        </div>

        {/* 5-Star Histogram */}
        <div className="flex-1 w-full space-y-2.5 pt-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.histogram[stars as keyof typeof stats.histogram] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-700 font-bold text-right">{stars} ★</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <strong className="w-8 text-slate-800 font-extrabold text-left">{count}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:border-blue-300">
          <strong className="text-3xl sm:text-4xl font-black text-blue-600">{stats.total}</strong>
          <span className="text-xs text-slate-600 font-bold mt-1">{t.total_reviews_label}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:border-amber-300">
          <strong className="text-3xl sm:text-4xl font-black text-amber-500">{stats.average.toFixed(1)}</strong>
          <span className="text-xs text-slate-600 font-bold mt-1">{t.average_rating_label}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:border-emerald-300">
          <strong className="text-3xl sm:text-4xl font-black text-emerald-600">{stats.verified}</strong>
          <span className="text-xs text-slate-600 font-bold mt-1">{t.verified_customers_label}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:border-indigo-300">
          <strong className="text-3xl sm:text-4xl font-black text-indigo-600">{stats.sources}</strong>
          <span className="text-xs text-slate-600 font-bold mt-1">{t.sources_label}</span>
        </div>
      </div>
    </div>
  );
};
