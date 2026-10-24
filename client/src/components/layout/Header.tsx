import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { TranslationStrings } from '../../i18n/translations';

interface HeaderProps {
  t: TranslationStrings;
  lang: string;
  onLanguageChange: (lang: string) => void;
  onNavigateAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ t, lang, onLanguageChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 20;
        setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const navItems = [
    { label: t.nav[0], href: '#about' },
    { label: t.nav[1], href: '#services' },
    { label: t.nav[2], href: '#specs' },
    { label: t.nav[3], href: '#customers' },
    { label: t.nav[4], href: '#reviews' },
    { label: t.nav[5], href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-header shadow-xl py-2.5 sm:py-3' : 'bg-[#06192c]/95 backdrop-blur-md py-3.5 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with Protected Margin to Prevent Overlap */}
        <a
          href="#top"
          className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl flex-shrink-0 mr-4 sm:mr-8"
          aria-label="Louka Engineering Home"
        >
          <BrandLogo light />
        </a>

        {/* Desktop Navigation with whitespace-nowrap preventing text collision */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 flex-shrink-0">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs xl:text-sm font-bold text-slate-300 hover:text-white transition-colors whitespace-nowrap py-1 px-1 border-b-2 border-transparent hover:border-blue-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions & Language Selector */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
          <div className="relative flex items-center">
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Select Language"
              className="bg-blue-950/80 border border-blue-400/40 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm hover:border-blue-400"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ் (TA)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (HI)</option>
            </select>
          </div>

          <a
            href="#contact"
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-blue-500/25 whitespace-nowrap"
          >
            {t.hero_request}
          </a>
        </div>

        {/* Tablet & Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2 sm:gap-3">
          <select
            value={lang}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select Language"
            className="bg-blue-950/90 border border-blue-400/40 text-white text-xs font-bold rounded-lg px-2 py-1 cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="ta">TA</option>
            <option value="hi">HI</option>
          </select>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 rounded-lg bg-blue-900/40 border border-blue-400/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-header border-t border-slate-800 px-5 pt-4 pb-7 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-200 hover:text-white py-2 border-b border-slate-800/60 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg"
            >
              {t.hero_request}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
