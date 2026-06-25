import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://devex-tools.net',
  output: 'static',
  build: {
    assets: '_assets',
  },
});
