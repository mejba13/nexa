import type { Config } from 'tailwindcss';

/**
 * Shared Nexa brand preset.
 * Brand: pure black surface, vibrant orange primary, dark-only theme.
 * Typography: Google Sans Display (headings), Google Sans Text (body), JetBrains Mono (code).
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
          muted: '#8A8A8A',
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
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 145, 0, 0.35)',
        'glow-lg': '0 0 80px rgba(255, 145, 0, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':
          'linear-gradient(135deg, #FF9100 0%, #FB8C00 50%, #E65100 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default nexaPreset;
