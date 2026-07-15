import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.commandlinux.dev',

  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],

  markdown: {
    // 'pre-mermaid' NÃO usa Playwright: apenas prepara os blocos no build.
    // A renderização vira SVG no browser via o script no BaseLayout.
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'pre-mermaid' }],
    ],
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },

  adapter: vercel(),
});