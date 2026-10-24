import React from 'react';
import { TranslationStrings } from '../../i18n/translations';

interface WhyChooseUsSectionProps {
  t: TranslationStrings;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ t }) => {
  const points = [
    {
      title: '100% Duty Cycle Reliability',
      desc: 'Our high-output BOIS welding transformers deliver continuous operation without thermal tripping or weld inconsistency.',
    },
    {
      title: 'Tested Stud Integrity',
      desc: 'Daily 15° bend testing and ring hammer acoustic inspection on test studs ensure 100% metallurgical fusion before concrete pouring.',
    },
    {
      title: 'Zero Lost-Time Injury Record',
      desc: 'Comprehensive slab edge protection, certified safety harness tie-offs, and daily toolbox meetings protect our workers and your site.',
    },
    {
      title: 'Transparent Project Delivery',
      desc: 'Real-time progress reporting, daily joint count sign-offs, and verified inspection records delivered to project managers.',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200" id="why">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            {t.why_eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.why_h2}
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Why leading contractors trust Louka Engineering with their composite steel structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {points.map((p, idx) => (
            <div key={p.title} className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
