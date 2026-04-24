import type { Config } from 'tailwindcss';

/**
 * Shared Nexa brand preset.
 * Brand: pure black surface, vibrant orange primary, dark-only theme.
 *
 * Typography commits to a deliberate three-font hierarchy:
 *   - display  · Google Sans Display  → primary headlines, UI labels
 *   - serif    · Instrument Serif     → editorial pull quotes, hero lead-in italics
 *   - sans     · Google Sans Text     → body copy, paragraphs
 *   - mono     · JetBrains Mono       → code, timestamps, numeric data, editorial section markers
 */
export const nexaPreset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#000000',
          surface: '#0A0A0A',
          elevated: '#111111',
          border: '#1F1F1F',
          'border-strong': '#2A2A2A',
          muted: '#8A8A8A',
          'muted-strong': '#B3B3B3',
          text: '#F5F5F5',
          primary: {
            DEFAULT: '#FF9100',
            50: '#FFF3E0',
            100: '#FFE0B2',
            200: '#FFCC80',
            300: '#FFB74D',
            400: '#FFA726',
            500: '#FF9100',
            600: '#FB8C00',
            700: '#F57C00',
            800: '#EF6C00',
            900: '#E65100',
          },
          accent: '#FFB74D',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Google Sans Display"', 'system-ui', 'sans-serif'],
        sans: ['"Google Sans Text"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Editorial-grade display sizes; clamp() so large hero type stays readable on mobile.
        'display-xs': [
          'clamp(2rem, 4vw + 1rem, 3rem)',
          { lineHeight: '1.02', letterSpacing: '-0.02em' },
        ],
        'display-sm': [
          'clamp(2.5rem, 5vw + 1rem, 3.75rem)',
          { lineHeight: '1.02', letterSpacing: '-0.025em' },
        ],
        'display-md': [
          'clamp(3.5rem, 7vw + 1rem, 5.5rem)',
          { lineHeight: '0.98', letterSpacing: '-0.03em' },
        ],
        'display-lg': [
          'clamp(4.5rem, 10vw + 1rem, 8rem)',
          { lineHeight: '0.92', letterSpacing: '-0.035em' },
        ],
        'display-xl': [
          'clamp(6rem, 14vw, 12rem)',
          { lineHeight: '0.88', letterSpacing: '-0.04em' },
        ],
      },
      letterSpacing: {
        'editorial-wide': '0.28em',
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 145, 0, 0.35)',
        'glow-lg': '0 0 80px rgba(255, 145, 0, 0.45)',
        'glow-inset': 'inset 0 0 0 1px rgba(255, 145, 0, 0.5)',
        hairline: '0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #FF9100 0%, #FB8C00 50%, #E65100 100%)',
        // Tight noise texture emulating print grain; data-URI keeps it CSS-only (no image fetch).
        grain:
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
        // Background of alternating vertical orange/dark stripes for editorial accents.
        'brand-ruled':
          'repeating-linear-gradient(90deg, transparent 0, transparent 23px, rgba(255,145,0,0.08) 23px, rgba(255,145,0,0.08) 24px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 80s linear infinite',
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        ticker: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default nexaPreset;
