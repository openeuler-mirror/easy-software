import { createRouter, createWebHistory } from 'vue-router';

import { scrollToTop } from '@/utils/common';
import { useLangStore } from '@/stores';


const routes = [
  {
    path: '/',
    component: () => import('@/views/home/TheHome.vue'),
  },
  { path: '/zh/', component: () => import('@/views/home/TheHome.vue'), },
  { path: '/en/', component: () => import('@/views/home/TheHome.vue'), },

  {
    path: '/zh/applicationsPackage',
    name: 'applicationsPackage',
    alias: '/en/applicationsPackage',
    component: () => import('@/views/applicationsPackage/TheApplicationsPackage.vue'),
  },
  {
    path: '/zh/applicationsPackage/:name',
    name: 'applicationsPackage-detail',
    alias: '/en/applicationsPackage/:name',
    component: () => import('@/views/applicationsPackage/TheNewDetail.vue'),
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
    path: '/zh/upstream/:name',
    name: 'upstream-detail',
    alias: '/en/upstream/:name',
    component: () => import('@/views/upstream/TheDetail.vue'),
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
    path: '/zh/epkg/:name',
    name: 'epkg-detail',
    alias: '/en/epkg/:name',
    component: () => import('@/views/epkg/TheDetail.vue'),
  },
  {
    path: '/zh/package/:name',
    name: 'package-detail',
    alias: '/en/package/:name',
    component: () => import('@/views/package/TheDetail.vue'),
  },
  {
    path: '/zh/image/:name',
    name: 'image-detail',
    alias: '/en/image/:name',
    component: () => import('@/views/image/TheDetail.vue'),
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
export default router;
