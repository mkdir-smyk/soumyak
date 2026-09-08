import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Configured for repository named 'soumyak' on GitHub
  site: 'https://mkdir-smyk.github.io',
  base: '/soumyak',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
