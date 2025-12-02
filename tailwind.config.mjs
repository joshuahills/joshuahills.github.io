/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#0b0c10',
        'custom-surface': '#1f2833',
        'custom-primary': '#66fcf1',
        'custom-secondary': '#45a29e',
        'custom-accent': '#c5c6c7',
        'custom-text': '#ffffff',
        'custom-muted': '#8892b0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
