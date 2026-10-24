import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#06192c',
          navyMid: '#0a2540',
          navyLight: '#102e52',
          primary: '#135dc5',
          primaryHover: '#0e4ca4',
          accent: '#e7a600',
          accentLight: '#f9d879',
          border: '#dce6f5',
          borderDark: '#cbd8ea',
          bgLight: '#f5f8ff',
          textDark: '#10223a',
          muted: '#586b87',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'critical-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'critical-pulse': {
          '0%, 100%': { filter: 'brightness(0.85)' },
          '45%': { filter: 'brightness(1.6)' },
        },
        'critical-weld': {
          '0%, 15%, 100%': { opacity: '0', transform: 'scale(0.7) rotate(20deg)' },
          '25%, 45%': { opacity: '1', transform: 'scale(1.2) rotate(20deg)' },
          '60%': { opacity: '0' },
        },
        'critical-spark': {
          '0%, 20%': { opacity: '0', transform: 'translate(0,0) scale(0.5)' },
          '35%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translate(18px,-17px) scale(0)' },
        },
        'critical-progress': {
          from: { transform: 'translateX(-160%)' },
          to: { transform: 'translateX(390%)' },
        },
      },
      animation: {
        'critical-spin': 'critical-spin 8s linear infinite',
        'critical-spin-reverse': 'critical-spin 14s linear infinite reverse',
        'critical-pulse': 'critical-pulse 2s ease-in-out infinite',
        'critical-weld': 'critical-weld 2s ease-in-out infinite',
        'critical-spark': 'critical-spark 2s ease-out infinite',
        'critical-progress': 'critical-progress 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
