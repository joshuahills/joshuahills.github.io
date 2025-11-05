/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#0a0a0f',
        'custom-surface': '#16161d',
        'custom-primary': '#00ff88',
        'custom-secondary': '#ff0066',
        'custom-accent': '#00ccff',
        'custom-text': '#e8e8f0',
        'custom-muted': '#8888a0',
      },
      fontFamily: {
        mono: ['Courier New', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
