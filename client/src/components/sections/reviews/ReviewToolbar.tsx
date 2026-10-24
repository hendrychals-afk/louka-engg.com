import React from 'react';
import { TranslationStrings } from '../../../i18n/translations';

interface ReviewToolbarProps {
  t: TranslationStrings;
  ratingFilter: string;
  onRatingFilterChange: (val: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (val: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (val: boolean) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
}

export const ReviewToolbar: React.FC<ReviewToolbarProps> = ({
  t,
  ratingFilter,
  onRatingFilterChange,
  serviceFilter,
  onServiceFilterChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t.filter_rating_label}</label>
          <select
            value={ratingFilter}
            onChange={(e) => onRatingFilterChange(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{t.filter_all_ratings}</option>
            <option value="5">5 ★★★★★</option>
            <option value="4">4 ★★★★☆</option>
            <option value="3">3 ★★★☆☆</option>
            <option value="2">2 ★★☆☆☆</option>
            <option value="1">1 ★☆☆☆☆</option>
          </select>
        </div>

        {/* Service Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t.filter_service_label}</label>
          <select
            value={serviceFilter}
            onChange={(e) => onServiceFilterChange(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{t.filter_all_services}</option>
            <option value="Stud Fixing">Stud Fixing</option>
            <option value="Deck Sheet Stud Fixing">Deck Sheet Stud Fixing</option>
            <option value="Coil Stud Fixing">Coil Stud Fixing</option>
            <option value="Deck Sheet Laying">Deck Sheet Laying</option>
            <option value="Reinforcement">Reinforcement</option>
            <option value="Roofing">Roofing</option>
            <option value="ROB & FOB">ROB &amp; FOB</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Verified checkbox */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none ml-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          {t.filter_verified_only}
        </label>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t.sort_label}</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="newest">{t.sort_newest}</option>
          <option value="highest">{t.sort_highest}</option>
          <option value="lowest">{t.sort_lowest}</option>
        </select>
      </div>
    </div>
  );
};
