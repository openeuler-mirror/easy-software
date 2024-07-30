import { createRouter, createWebHistory } from 'vue-router';

import { scrollToTop } from '@/utils/common';
import { useLangStore, useViewStore } from '@/stores/common';
import { tryLogin } from '@/shared/login';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { queryUpstreamPermission } from '@/api/api-user';

const routes = [
  {
    path: '/',
    redirect: '/zh',
  },
  { path: '/zh', name: 'home', component: () => import('@/views/home/TheHome.vue') },
  { path: '/en/', redirect: '/zh' },
  {
    path: '/zh/field',
    name: 'field',
    alias: '/en/field',
    component: () => import('@/views/field/TheField.vue'),
  },
  {
    path: '/zh/field/detail',
    name: 'field-detail',
    alias: '/en/field/detail',
    component: () => import('@/views/field/TheFieldDetail.vue'),
  },
  {
    path: '/zh/rpm',
    name: 'rpm',
    alias: '/en/rpm',
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
  // {
  //   path: '/zh/epkg',
  //   name: 'epkg',
  //   alias: '/en/epkg',
  //   component: () => import('@/views/epkg/TheEpkg.vue'),
  // },
  // {
  //   path: '/zh/epkg/detail',
  //   name: 'epkg-detail',
  //   alias: '/en/epkg/detail',
  //   component: () => import('@/views/epkg/TheEpkgDetail.vue'),
  // },
  {
    path: '/zh/oepkg',
    name: 'oepkg',
    alias: '/en/oepkg',
    component: () => import('@/views/oepkg/TheOEpkg.vue'),
  },
  {
    path: '/zh/oepkg/detail',
    name: 'oepkg-detail',
    alias: '/en/oepkg/detail',
    component: () => import('@/views/oepkg/TheOEpkgDetail.vue'),
  },
  {
    path: '/zh/rpm/detail',
    name: 'rpm-detail',
    alias: '/en/rpm/detail',
    component: () => import('@/views/package/TheRpmDetail.vue'),
  },
  {
    path: '/zh/image/detail',
    name: 'image-detail',
    alias: '/en/image/detail',
    component: () => import('@/views/image/TheImageDetail.vue'),
  },
  {
    path: '/zh/solution/openhpc',
    name: 'openhpc',
    alias: '/en/solution/openhpc',
    component: () => import('@/views/solution/TheOpenHPC.vue'),
  },
  {
    path: '/zh/solution/openstack',
    name: 'openstack',
    alias: '/en/solution/openstack',
    component: () => import('@/views/solution/TheOpenStack.vue'),
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

router.beforeEach(async (to) => {
  document.body.scrollTop = 0;
  // firefox
  document.documentElement.scrollTop = 0;
  // to.name

  // 设置语言
  const langStore = useLangStore();
  const lang = to.path.startsWith('/en') ? 'en' : 'zh';
  langStore.lang = lang;

  const userInfoStore = useUserInfoStore();
  const isUpstream = to.name === 'upstream';
  const loginStore = useLoginStore();
  if (loginStore.isLogined) {
    if (isUpstream) {
      return userInfoStore.upstreamPermission ? true : { name: 'notFound' };
    }
    return true;
  }

  await tryLogin();
  if (userInfoStore.upstreamPermission === null && loginStore.isLogined) {
    try {
      const upstreamPermission = await queryUpstreamPermission();
      userInfoStore.upstreamPermission = upstreamPermission.data.allow_access;
    } catch {
      // 如果queryUpstreamPermission不是401
      return isUpstream ? { name: 'notFound' } : true;
    }
  }

  if (isUpstream) {
    return loginStore.isLogined && userInfoStore.upstreamPermission ? true : { name: 'notFound' };
  }

  return true;
});

router.afterEach(() => {
  useViewStore().$patch({ notFoundPage: false });
});

export default router;
