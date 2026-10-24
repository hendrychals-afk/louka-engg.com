import React, { useState } from 'react';
import { StarRating } from '../../common/StarRating';
import { PublicReview } from '../../../types';
import { TranslationStrings } from '../../../i18n/translations';
import { submitPublicReview } from '../../../services/supabase';

interface ReviewFormProps {
  t: TranslationStrings;
  onReviewSubmitted: (newReview: PublicReview) => void;
  whatsappNumber: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ t, onReviewSubmitted, whatsappNumber }) => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState('Stud Fixing');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showShare, setShowShare] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Photo must be under 2 MB.' });
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setStatusMessage(null);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !text.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in your name, role, and review text.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('rating', String(rating));
    formData.append('name', name.trim());
    formData.append('role', role.trim());
    formData.append('company', company.trim());
    formData.append('service', service);
    formData.append('email', email.trim());
    formData.append('text', text.trim());
    formData.append('website', honeypot); // honeypot bot trap
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const data = await submitPublicReview({
        name: name.trim(),
        role: role.trim(),
        company: company.trim(),
        service,
        rating,
        text: text.trim(),
        photo,
        website: honeypot,
      });

      setStatusMessage({ type: 'success', text: data.message });

      if (rating >= 4) {
        setShowShare(true);
      }

      // Reset form fields
      setName('');
      setRole('');
      setCompany('');
      setEmail('');
      setText('');
      removePhoto();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setLoading(false);
    }
  };

  const cleanWaNumber = (whatsappNumber || '918667556619').replace(/\D/g, '');
  const whatsappShareUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `I recently worked with Louka Engineering for ${service} and gave them ${rating} stars! "${text.slice(0, 100)}..."`
  )}`;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-12">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{t.form_title}</h3>
        <p className="text-xs text-slate-500 mt-1">{t.form_note}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {t.form_rating} <span className="text-amber-500 font-bold">({rating} of 5 stars)</span>
          </label>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block">
            <StarRating value={rating} interactive onChange={(val) => setRating(val)} size="lg" />
          </div>
        </div>

        {/* Name and Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.form_name}
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.form_role}
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Project Manager"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Company and Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.form_company}
            </label>
            <input
              type="text"
              maxLength={120}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. L&T – Trichy Plant"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.form_service}
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
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
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.form_email}
          </label>
          <input
            type="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.form_review}
          </label>
          <textarea
            required
            rows={4}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share details of your experience with our crew, equipment performance, weld quality, and project safety..."
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.form_photo}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {photoPreview && (
            <div className="mt-2 relative inline-block">
              <img src={photoPreview} alt="Upload preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Honeypot field for anti-bot protection */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="hp_website">Website</label>
          <input
            type="text"
            id="hp_website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-blue-500/25 cursor-pointer"
          >
            {loading ? t.submitting : t.form_submit}
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* WhatsApp Share Banner */}
        {showShare && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-semibold text-blue-900">
              {t.share_prompt}
            </span>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              {t.share_whatsapp}
            </a>
          </div>
        )}
      </form>
    </div>
  );
};
