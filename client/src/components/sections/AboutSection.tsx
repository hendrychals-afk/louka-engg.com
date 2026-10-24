import React from 'react';
import { TranslationStrings } from '../../i18n/translations';

interface AboutSectionProps {
  t: TranslationStrings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ t }) => {
  return (
    <section className="py-20 bg-white border-b border-slate-200" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            {t.about_eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.about_h2}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.about_lead}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Safety Above All</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every job begins with strict site risk assessment, complete PPE compliance, and zero-compromise safety protocols on active slabs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Modern BOIS Equipment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We deploy industrial-grade BOIS stud welding systems capable of sustained high-amperage output and 100% duty cycle operation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">On-Time Mobilization</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Based in Thuvakudi, Trichy, our teams mobilize across industrial corridors across South India with complete self-contained tooling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
