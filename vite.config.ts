// import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import path from 'path';

import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
    Icons({
      compiler: 'vue3',
      customCollections: {
        app: FileSystemIconLoader('./src/assets/svg-icons'),
        pkg: FileSystemIconLoader('./src/assets/icon'),
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/style/mixin/screen.scss" as *;
          @use "@/assets/style/mixin/font.scss" as *;
          @use "@/assets/style/mixin/common.scss" as *;
          @use "@/assets/style/global.scss" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, './src')}/`,
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
    },
  },
  server: {
    proxy: {
      '/api-omapi/': {
        target: 'https://omapi.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-omapi/, ''),
      },
      '/api-query/': {
        target: 'https://easysoftware-api.test.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-query/, ''),
      },
      '/dsapi/': {
        target: 'https://dsapi.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dsapi/, ''),
      },
      '/monitoring/': {
        target: 'https://easysoftware-monitoring.test.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/monitoring/, ''),
      },
      '/api-search/': {
        target: 'https://doc-search.test.osinfra.cn/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-search/, ''),
      },
    },
  },




});
