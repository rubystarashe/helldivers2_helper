import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const version = packageJson.version;

export default {
  runtimeConfig: {
    public: {
      version,
    },
  },

  ssr: false,
  target: 'static',

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+KR:wght@100..900&display=swap',
        },
      ],
    },
  },

  modules: [
    "@vue-macros/nuxt",
    "@vueuse/nuxt"
    // "@vite-pwa/nuxt"
  ],

  imports: {
    dirs: [
      './composables/**',
      './utils/**',
      './models/**'
    ]
  },

  devtools: {
    enabled: false
  },

  nitro: {
    output: {
      publicDir: './dist'
    }
  },

  compatibilityDate: '2025-01-27',
};