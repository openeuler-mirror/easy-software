import { createRouter, createWebHistory } from 'vue-router';

import { scrollToTop } from '@/utils/common';
import { useLangStore, useViewStore } from '@/stores/common';


const routes = [
  {
    path: '/',
    component: () => import('@/views/home/TheHome.vue'),
  },
  { path: '/zh/', component: () => import('@/views/home/TheHome.vue'), },
  { path: '/en/', component: () => import('@/views/home/TheHome.vue'), },
  {
    path: '/zh/apppkg',
    name: 'apppkg',
    alias: '/en/apppkg',
    component: () => import('@/views/apppkg/TheAppPkg.vue'),
  },
  {
    path: '/zh/apppkg/detail',
    name: 'apppkg-detail',
    alias: '/en/apppkg/detail',
    component: () => import('@/views/apppkg/TheNewDetail.vue'),
  },
  {
    path: '/zh/package',
    name: 'package',
    alias: '/en/package',
    component: () => import('@/views/package/TheRpm.vue'),
  },
  {
    path: '/zh/upstream',
    name: 'upstream',
    alias: '/en/upstream',
    component: () => import('@/views/upstream/TheUpstream.vue'),
  },
  {
    path: '/zh/search',
    name: 'search',
    alias: '/en/search',
    component: () => import('@/views/search/TheSearch.vue'),
  },
  {
    path: '/zh/image',
    name: 'image',
    alias: '/en/image',
    component: () => import('@/views/image/TheImage.vue'),
  },
  {
    path: '/zh/epkg',
    name: 'epkg',
    alias: '/en/epkg',
    component: () => import('@/views/epkg/TheEpkg.vue'),
  },
  {
    path: '/zh/epkg/detail',
    name: 'epkg-detail',
    alias: '/en/epkg/detail',
    component: () => import('@/views/epkg/TheDetail.vue'),
  },
  {
    path: '/zh/package/detail',
    name: 'package-detail',
    alias: '/en/package/detail',
    component: () => import('@/views/package/TheDetail.vue'),
  },
  {
    path: '/zh/image/detail',
    name: 'image-detail',
    alias: '/en/image/detail',
    component: () => import('@/views/image/TheDetail.vue'),
  },
  // 默认路由
  {
    path: '/:path(.*)*',
    name: 'notFound',
    component: () => {
      return import('@/components/ResultNotFound.vue');
    },
    meta: { title: '404' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    scrollToTop(0, false);
  },
});

router.beforeEach((to, from, next) => {
  document.body.scrollTop = 0;
  // firefox
  document.documentElement.scrollTop = 0;

  // 设置语言
  const langStore = useLangStore();
  const lang = to.path.startsWith('/en') ? 'en' : 'zh';
  langStore.lang = lang;


  next();
});

router.afterEach(() => {
  useViewStore().$patch({ notFoundPage: false });
});

export default router;
