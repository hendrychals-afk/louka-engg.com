import React from 'react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#051424] text-slate-400 border-t border-slate-800/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <BrandLogo light className="h-9" />
        <div className="text-center md:text-right text-xs">
          <p className="font-medium text-slate-300">
            &copy; {year} Louka Engineering. All rights reserved.
          </p>
          <p className="text-slate-500 mt-1">
            E-33 AD.P. Estate, Thuvakudi, Trichy - 620015 · Phone: +91 86675 56619
          </p>
        </div>
      </div>
    </footer>
  );
};
