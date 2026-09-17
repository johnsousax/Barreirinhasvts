import type { Config } from 'tailwindcss';

// Tokens extraídos do logotipo oficial: azul-marinho do "AVENTURE",
// azul-lagoa do "TURISMO" e da onda, laranja das dunas.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', lg: '2rem' }, screens: { '2xl': '1240px' } },
    extend: {
      colors: {
        duna: { 950: '#061A33', 900: '#0A2749', 800: '#0E3A6E', 700: '#154C8C', 600: '#1D5FA8' },
        lagoa: { 700: '#0B5F94', 600: '#0F72B0', 500: '#1486C9', 300: '#7CC3EA', 100: '#DDEFFA', 50: '#EFF7FC' },
        sol: { 700: '#B8660A', 600: '#E0850B', 500: '#F59E1B', 400: '#F8B444', 100: '#FDEBCB', 50: '#FEF6E7' },
        areia: { 50: '#FCFAF6', 100: '#F6F0E6', 200: '#EADFCB', 400: '#C9B592' },
        ink: { DEFAULT: '#0B2340', soft: '#3E5573', muted: '#6B7F99' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(14,58,110,.06), 0 8px 24px -12px rgba(14,58,110,.18)',
        lift: '0 2px 4px rgba(14,58,110,.06), 0 24px 48px -20px rgba(14,58,110,.35)',
        panel: '0 1px 0 rgba(14,58,110,.06), 0 1px 3px rgba(14,58,110,.08)',
      },
      keyframes: {
        'hero-zoom': { from: { transform: 'scale(1.08)' }, to: { transform: 'scale(1)' } },
        'rise': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        'fade': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'hero-zoom': 'hero-zoom 2.4s cubic-bezier(.2,.7,.2,1) both',
        rise: 'rise .8s cubic-bezier(.2,.7,.2,1) both',
        fade: 'fade .25s ease-out both',
        'slide-in': 'slide-in .3s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
export default config;
