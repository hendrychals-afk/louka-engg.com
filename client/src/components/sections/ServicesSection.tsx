import React from 'react';
import { TranslationStrings } from '../../i18n/translations';

interface ServicesSectionProps {
  t: TranslationStrings;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ t }) => {
  const services = [
    {
      title: 'Stud Fixing',
      code: 'SF-01',
      desc: 'Shear connector stud welding for composite slabs, steel-concrete composite beams, and bridge structures.',
      points: ['Drawn arc stud welding', '19mm & 22mm shear connectors', 'High-shear strength bond'],
    },
    {
      title: 'Deck Sheet Stud Fixing',
      code: 'DSF-02',
      desc: 'Through-deck stud fixing directly penetrating profiled metal sheets into steel girder top flanges.',
      points: ['Through-deck fusion', 'Eliminates pre-drilling', 'Ceramic ferrule arc shielding'],
    },
    {
      title: 'Coil Stud Fixing',
      code: 'CSF-03',
      desc: 'Heavy-duty threaded coil stud welding for modular tie-ins, precast panels, and heavy equipment anchors.',
      points: ['High-tensile load rated', 'Threaded coil anchors', 'Instant alignment precision'],
    },
    {
      title: 'Deck Sheet Laying',
      code: 'DSL-04',
      desc: 'Precision layout and alignment of profiled metal deck sheets with secure lap joints and edge containment.',
      points: ['Side lap crimping & fastening', 'Zero site sag alignment', 'Rapid coverage per shift'],
    },
    {
      title: 'Reinforcement & Mesh',
      code: 'RF-05',
      desc: 'Reinforcement steel placement, welded wire mesh integration, and shear link tying on profiled decking.',
      points: ['Structural bar tying', 'Cover block positioning', 'Quality inspection sign-off'],
    },
    {
      title: 'ROB & FOB Infrastructure',
      code: 'INF-06',
      desc: 'Specialized fixing for Railway Over Bridges, Foot Over Bridges, and heavy civil steel structures.',
      points: ['Railway safety compliance', 'Strict quality records', 'Rapid block mobilization'],
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            {t.services_eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.services_h2}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            End-to-end stud welding and composite decking services engineered for demanding structural specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-blue-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                    {item.code}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">{item.desc}</p>
              </div>

              <ul className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-700">
                {item.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
