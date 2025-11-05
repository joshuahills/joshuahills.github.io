import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://joshuahills.github.io',
  srcDir: './src',
  publicDir: './public',
  integrations: [tailwind()],
});
