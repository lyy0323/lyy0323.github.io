/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 通道值 + <alpha-value>：颜色由 src/styles/global.css 的 CSS 变量提供，
        // 因此 bg-terminal-green/10 这类透明度写法在亮/暗两套主题下都自动成立。
        terminal: {
          bg: 'rgb(var(--c-bg) / <alpha-value>)',
          surface: 'rgb(var(--c-surface) / <alpha-value>)',
          border: 'rgb(var(--c-border) / <alpha-value>)',
          green: 'rgb(var(--c-green) / <alpha-value>)',
          cyan: 'rgb(var(--c-cyan) / <alpha-value>)',
          amber: 'rgb(var(--c-amber) / <alpha-value>)',
          pink: 'rgb(var(--c-pink) / <alpha-value>)',
          purple: 'rgb(var(--c-purple) / <alpha-value>)',
          muted: 'rgb(var(--c-muted) / <alpha-value>)',
          text: 'rgb(var(--c-text) / <alpha-value>)',
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
