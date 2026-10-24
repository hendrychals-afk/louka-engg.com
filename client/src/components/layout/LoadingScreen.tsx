import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('louka_loader_shown');
    } catch {
      return true;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem('louka_loader_shown', 'true');
    } catch {
      // ignore
    }

    const startedAt = Date.now();
    const minDisplayMs = 1000;

    const handleLoad = () => {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, minDisplayMs - elapsed);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 700);
      }, wait);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

    const fallbackTimer = setTimeout(handleLoad, 3000);
    return () => clearTimeout(fallbackTimer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Louka Engineering"
      className={`fixed inset-0 z-[99999] grid place-items-center align-content-center overflow-hidden loader-gradient text-white transition-all duration-700 ${
        fading ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      {/* Background glow effects */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[90px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[100px] -bottom-20 -right-20 pointer-events-none" />

      {/* Official Company Logo */}
      <div className="relative w-28 h-28 mb-6 flex items-center justify-center select-none" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-xl animate-pulse" />
        <div className="absolute -inset-2 rounded-full border border-blue-400/30 border-t-sky-300 animate-critical-spin" />
        <img
          src="/brand/logo.png"
          alt="Louka Engineering logo"
          className="w-20 h-20 object-contain drop-shadow-[0_0_16px_rgba(56,189,248,0.7)]"
        />
      </div>

      <div className="text-center">
        <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-blue-300 mb-1">
          Trichy · Tamil Nadu
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Louka<span className="text-blue-400 font-bold ml-0.5">Engineering</span>
        </h1>
        <p className="text-xs tracking-wider uppercase text-blue-100/70 mt-1">
          Built to last. Welded to perform.
        </p>
      </div>

      <div className="w-[min(220px,56vw)] h-0.5 bg-blue-900/50 rounded-full overflow-hidden mt-7">
        <span className="block w-2/5 h-full bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-critical-progress" />
      </div>

      <p className="text-xs text-blue-200/60 mt-3 font-medium">
        Preparing precision engineering...
      </p>
    </div>
  );
};
