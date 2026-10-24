import React from 'react';

export const CustomersSection: React.FC = () => {
  const clients = [
    { name: 'L&T', role: 'Infrastructure & Construction' },
    { name: 'Kirby Building Systems', role: 'Pre-Engineered Steel' },
    { name: 'Casa Grande', role: 'Residential & Commercial' },
    { name: 'PSK Group', role: 'Industrial Contracting' },
    { name: 'Metal Scope', role: 'Steel Fabricators' },
    { name: 'Southern Railway', role: 'Bridge Infrastructure' },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200" id="customers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
          Trusted by Industry Leaders Across South India
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {clients.map((c) => (
            <div
              key={c.name}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-center items-center hover:bg-slate-100/80 transition-colors"
            >
              <span className="font-extrabold text-slate-900 text-base tracking-tight">{c.name}</span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">{c.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
