import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-10 w-auto',
  light = false,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeDimensions = {
    sm: 'w-8 h-8 md:w-9 md:h-9',
    md: 'w-10 h-10 md:w-11 md:h-11',
    lg: 'w-14 h-14 md:w-16 md:h-16',
  };

  const textSizes = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none flex-shrink-0 ${className}`}>
      {/* Official Louka Engineering Company Logo */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <img
          src={imgError ? '/brand/logo.jpg' : '/brand/logo.png'}
          alt="Louka Engineering official logo"
          className={`${sizeDimensions[size]} object-contain flex-shrink-0 transition-transform duration-300 hover:scale-105 ${
            light ? 'drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'drop-shadow-sm'
          }`}
          onError={() => {
            if (!imgError) setImgError(true);
          }}
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <span
          className={`${textSizes[size]} font-black tracking-tight ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          Louka<span className="text-[#0985c1] font-extrabold ml-1">Engineering</span>
        </span>
        <span
          className={`text-[10px] md:text-[11px] tracking-widest uppercase font-bold mt-1 ${
            light ? 'text-blue-200/80' : 'text-slate-500'
          }`}
        >
          Trichy · Tamil Nadu
        </span>
      </div>
    </div>
  );
};
