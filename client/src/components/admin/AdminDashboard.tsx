import React, { useState, useEffect } from 'react';
import { AdminReview, AdminReviewSummary } from '../../types';
import { fetchAdminReviews, executeAdminAction } from '../../services/supabase';
import { StarRating } from '../common/StarRating';
import { ReviewEditModal } from './ReviewEditModal';
import { BrandLogo } from '../common/BrandLogo';

interface AdminDashboardProps {
  csrfToken: string;
  onLogout: () => void;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  csrfToken,
  onLogout,
  onBackToSite,
}) => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [counts, setCounts] = useState<AdminReviewSummary>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingReview, setEditingReview] = useState<AdminReview | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReviews();
      setReviews(data.reviews || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
    } catch (err: any) {
      console.error('Failed to load admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const sendAction = async (action: string, id: string, confirmDelete = false, payload?: any) => {
    if (confirmDelete && !window.confirm('Permanently delete this review and its photo?')) {
      return;
    }

    try {
      await executeAdminAction(action, id, payload);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Could not perform action.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (r.name || '').toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q) ||
        (r.text || '').toLowerCase().includes(q) ||
        (r.service || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-slate-900 pb-20">
      {/* Admin Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" />
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-800 leading-tight">Review Management Portal</h1>
            <p className="text-[11px] text-slate-500">Louka Engineering Customer Reviews</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5"
          >
            ← View Website
          </button>
          <button
            onClick={onLogout}
            className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
            <span className="block text-2xl font-black text-amber-700">{counts.pending}</span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Reviews</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
            <span className="block text-2xl font-black text-emerald-700">{counts.approved}</span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved Reviews</span>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
            <span className="block text-2xl font-black text-rose-700">{counts.rejected}</span>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Rejected Reviews</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="search"
            placeholder="Search name, company, service, text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-500 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All statuses ({reviews.length})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="approved">Approved ({counts.approved})</option>
              <option value="rejected">Rejected ({counts.rejected})</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            No reviews match your query.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r) => {
              const statusBadges = {
                approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                pending: 'bg-amber-100 text-amber-800 border-amber-200',
                rejected: 'bg-rose-100 text-rose-800 border-rose-200',
              };

              return (
                <article
                  key={r.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        statusBadges[r.status] || statusBadges.pending
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.featured && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                        ★ Featured
                      </span>
                    )}
                    {r.verified && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Verified Customer
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {r.name} — <span className="font-normal text-slate-600">{r.role}</span>
                  </h3>

                  <p className="text-xs text-slate-500 mb-2">
                    {r.company ? `${r.company} · ` : ''}
                    {r.service} · {r.source || 'Website'} · Created: {r.createdAt}
                  </p>

                  <div className="my-2">
                    <StarRating value={r.rating} size="sm" />
                  </div>

                  <p className="text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-line mb-3">
                    {r.text}
                  </p>

                  {r.email && (
                    <p className="text-xs text-slate-500 font-mono mb-3">
                      Customer Email: <span className="text-slate-800">{r.email}</span>
                    </p>
                  )}

                  {r.photo && (
                    <div className="mb-4">
                      <img
                        src={r.photo}
                        alt="Customer submission"
                        className="w-36 h-24 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}

                  {/* Moderation Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 mt-3 text-xs font-bold">
                    <button
                      onClick={() => setEditingReview(r)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Edit
                    </button>

                    {r.status !== 'approved' && (
                      <button
                        onClick={() => sendAction('approve', r.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg"
                      >
                        Approve
                      </button>
                    )}

                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => sendAction('reject', r.id)}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => sendAction('feature', r.id, false, { featured: !r.featured })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300"
                    >
                      {r.featured ? 'Unfeature' : 'Feature'}
                    </button>

                    <button
                      onClick={() =>
                        sendAction('toggle_verified', r.id, false, { verified: !r.verified })
                      }
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300"
                    >
                      {r.verified ? 'Unverify' : 'Verify Customer'}
                    </button>

                    {r.photo && (
                      <button
                        onClick={() => sendAction('remove_photo', r.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-rose-600 px-3 py-1.5 rounded-lg border border-slate-300"
                      >
                        Remove Photo
                      </button>
                    )}

                    <button
                      onClick={() => sendAction('delete', r.id, true)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Edit Modal Dialog */}
        {editingReview && (
          <ReviewEditModal
            review={editingReview}
            csrfToken={csrfToken}
            onClose={() => setEditingReview(null)}
            onSaved={() => {
              setEditingReview(null);
              fetchReviews();
            }}
          />
        )}
      </main>
    </div>
  );
};
