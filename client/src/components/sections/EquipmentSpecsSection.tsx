import React, { useState, useEffect, useRef } from 'react';
import { TranslationStrings } from '../../i18n/translations';

interface EquipmentSpecsSectionProps {
  t: TranslationStrings;
}

export const EquipmentSpecsSection: React.FC<EquipmentSpecsSectionProps> = ({ t }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [counts, setCounts] = useState({
    studsFixed: 0,
    deckArea: 0,
    projects: 0,
    rating: 0,
  });

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ACCESSIBILITY FIX: If user prefers reduced motion, set final values immediately without animation
    if (prefersReducedMotion) {
      setCounts({ studsFixed: 150, deckArea: 85, projects: 45, rating: 4.8 });
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);

          const duration = 2000;
          const start = performance.now();

          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

            setCounts({
              studsFixed: Math.floor(ease * 150),
              deckArea: Math.floor(ease * 85),
              projects: Math.floor(ease * 45),
              rating: Math.floor(ease * 48) / 10,
            });

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCounts({ studsFixed: 150, deckArea: 85, projects: 45, rating: 4.8 });
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [animated]);

  return (
    <section ref={sectionRef} className="py-20 bg-slate-900 text-white border-b border-slate-800" id="specs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
            {t.specs_eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.specs_h2}
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Equipped with industrial BOIS equipment to tackle demanding bridge and commercial projects.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="block text-3xl sm:text-4xl font-black text-blue-400">
              {counts.studsFixed}k+
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1 block">Studs Fixed</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="block text-3xl sm:text-4xl font-black text-blue-400">
              {counts.deckArea}k+
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1 block">Sq.ft Deck Laid</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="block text-3xl sm:text-4xl font-black text-blue-400">
              {counts.projects}+
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1 block">Major Projects</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="block text-3xl sm:text-4xl font-black text-amber-400">
              {counts.rating.toFixed(1)} ★
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1 block">Average Rating</span>
          </div>
        </div>

        {/* Technical Specs Table */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              BOIS Equipment & Technical Specifications
            </h3>
          </div>
          <div className="divide-y divide-slate-700/60 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
              <span className="text-slate-400 font-medium">Power Source</span>
              <span className="sm:col-span-2 text-slate-200">Heavy-Duty Transformer Rectifier (3-Phase 415V, 50Hz)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
              <span className="text-slate-400 font-medium">Duty Cycle</span>
              <span className="sm:col-span-2 text-slate-200">100% Continuous Welding at rated current</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
              <span className="text-slate-400 font-medium">Stud Diameters</span>
              <span className="sm:col-span-2 text-slate-200">13mm, 16mm, 19mm, 22mm, 25mm Drawn Arc Studs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
              <span className="text-slate-400 font-medium">Welding Speed</span>
              <span className="sm:col-span-2 text-slate-200">Up to 800 - 1,200 studs per gun per 8-hour shift</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
              <span className="text-slate-400 font-medium">Quality Testing</span>
              <span className="sm:col-span-2 text-slate-200">15° Bend Testing per AWS D1.1 / ISO 14555 on site</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
