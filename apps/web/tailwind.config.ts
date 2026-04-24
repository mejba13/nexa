import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

import { nexaPreset } from '@nexa/config/tailwind/preset';

const config: Config = {
  darkMode: 'class',
  presets: [nexaPreset as Partial<Config>],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
  ],
  plugins: [animate],
};

export default config;
