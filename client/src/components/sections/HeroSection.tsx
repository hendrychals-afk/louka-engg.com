import React, { useState, useEffect } from 'react';
import { TranslationStrings } from '../../i18n/translations';
import { PublicReview } from '../../types';
import { StarRating } from '../common/StarRating';

interface HeroSectionProps {
  t: TranslationStrings;
  featuredReviews: PublicReview[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ t, featuredReviews }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Check if visitor prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || paused || featuredReviews.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredReviews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredReviews, paused]);

  const activeReview = featuredReviews[carouselIndex] || featuredReviews[0];

  return (
    <section className="hero-gradient text-white pt-36 pb-20 md:pt-44 md:pb-28 relative overflow-hidden" id="top">
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wider uppercase shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              {t.hero_eyebrow}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {t.hero_title_1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-sky-100">
                {t.hero_title_2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t.hero_lead}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <a
                href="#contact"
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                {t.hero_request}
              </a>
              <a
                href="#services"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-7 py-4 rounded-xl text-sm border border-slate-700/80 transition-all hover:-translate-y-0.5 shadow-md"
              >
                {t.hero_view_services}
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-white">100%</strong>
                <span className="text-xs text-slate-400 font-semibold">{t.hero_stat_duty}</span>
              </div>
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-white">Zero</strong>
                <span className="text-xs text-slate-400 font-semibold">{t.hero_stat_safety}</span>
              </div>
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-amber-400">4.8 ★</strong>
                <span className="text-xs text-slate-400 font-semibold">{t.hero_stat_rating}</span>
              </div>
            </div>
          </div>

          {/* Testimonial Spotlight Card with Pause on Hover */}
          <div
            className="lg:col-span-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative bg-slate-900/85 border border-slate-700/70 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {t.featured_label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaused(!paused)}
                    className="text-[10px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-semibold cursor-pointer transition-colors"
                    aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
                  >
                    {paused ? t.hero_resume : t.hero_pause}
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full font-bold">
                    ✓ {t.hero_verified_client}
                  </span>
                </div>
              </div>

              {activeReview ? (
                <div key={activeReview.id} className="transition-opacity duration-500">
                  <div className="mb-3">
                    <StarRating value={activeReview.rating} size="sm" />
                  </div>
                  <blockquote className="text-slate-100 text-sm sm:text-base italic font-normal leading-relaxed min-h-[72px]">
                    "{activeReview.text}"
                  </blockquote>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-white text-sm">{activeReview.name}</p>
                      <p className="text-xs text-slate-400">
                        {activeReview.role} {activeReview.company ? `· ${activeReview.company}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-blue-300">
                      {activeReview.service}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-sm py-8 text-center">Loading reviews...</div>
              )}

              {/* Carousel Navigation Dots */}
              {featuredReviews.length > 1 && (
                <div className="flex gap-2 mt-5 justify-center">
                  {featuredReviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === carouselIndex ? 'w-7 bg-blue-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
