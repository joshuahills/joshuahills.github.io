import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import { externalLink } from './src/external-link';

export default defineConfig({
  site: 'https://joshhills.co.uk',
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    rehypePlugins: [[externalLink, { domain: 'https://joshhills.co.uk' }]]
  }
});