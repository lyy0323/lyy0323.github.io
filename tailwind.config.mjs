/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#202026',
          surface: '#1e1e24',
          border: '#2e2e38',
          green: '#559977',
          cyan: '#557799',
          amber: '#997755',
          pink: '#995577',
          purple: '#775599',
          muted: '#737880',
          text: '#c8ccd0',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
        lxgw: ['lxgw', 'serif'],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'app-open': 'appOpen 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'app-close': 'appClose 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          from: { textShadow: '0 0 5px rgba(85, 153, 119, 0.3)' },
          to: { textShadow: '0 0 20px rgba(85, 153, 119, 0.5), 0 0 40px rgba(85, 153, 119, 0.15)' },
        },
        appOpen: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        appClose: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.85)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
