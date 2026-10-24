import React, { useState } from 'react';
import { TranslationStrings } from '../../i18n/translations';
import { submitContactInquiry } from '../../services/supabase';

interface ContactSectionProps {
  t: TranslationStrings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    // 10-digit Indian phone number validation
    const cleanDigits = phoneDigits.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setStatus({ type: 'error', text: 'Please enter a valid 10-digit Indian phone number.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const data = await submitContactInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: `+91${cleanDigits}`,
        message: message.trim(),
      });

      setStatus({ type: 'success', text: data.message });
      setName('');
      setEmail('');
      setPhoneDigits('');
      setMessage('');
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Could not send message.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white border-b border-slate-200" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-widest uppercase">
              {t.contact_eyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {t.contact_h2}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t.contact_lead}
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-100 text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-lg">📍</span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.contact_address_title}
                  </span>
                  <span className="text-slate-900 font-semibold mt-0.5 block">
                    E-33 AD.P. Estate, Thuvakudi, Trichy - 620015
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-lg">📞</span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.contact_phone_title}
                  </span>
                  <a href="tel:+918667556619" className="text-blue-600 font-extrabold hover:underline mt-0.5 block">
                    +91 86675 56619
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-lg">✉️</span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.contact_email_title}
                  </span>
                  <a href="mailto:edward@loukaengg.com" className="text-slate-800 hover:text-blue-600 font-semibold mt-0.5 block">
                    edward@loukaengg.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-lg">🌐</span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.contact_web_title}
                  </span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">www.loukaengg.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.contact_name_label}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.contact_email_label}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.contact_phone_label}
                </label>
                <div className="flex rounded-xl shadow-sm border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <span className="inline-flex items-center px-4 bg-slate-100 text-slate-700 font-bold text-sm border-r border-slate-300 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t.contact_phone_placeholder}
                    className="flex-1 text-sm px-4 py-3 focus:outline-none bg-white font-medium tracking-wide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.contact_message_label}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact_message_placeholder}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all resize-y"
                />
              </div>

              {status && (
                <div
                  className={`p-4 rounded-xl text-xs font-bold ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {status.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 cursor-pointer"
              >
                {loading ? t.contact_submitting : t.contact_submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
