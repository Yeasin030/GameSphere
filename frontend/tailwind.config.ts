import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#8B5CF6', // violet
          hover: '#7C3AED',
          focus: '#6D28D9',
        },
        accent: {
          lime: '#D5FF40', // Greenish yellow from tournaments page
          cyan: '#00F0FF', // Cyan accents
          blue: '#3B82F6', // Blue play buttons
          magenta: '#D946EF', // Magenta/pink accents
        },
        surface: {
          DEFAULT: '#14141E', // Base card background
          light: '#1F1F2E', // Lighter card background
          glass: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.1)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-space-grotesk)'],
      },
    },
  },
  plugins: [],
};
export default config;
