import { createRouter, createWebHistory } from 'vue-router';

import { scrollToTop } from '@/utils/common';
import { useLangStore, useViewStore } from '@/stores/common';
import { tryLogin } from '@/shared/login';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { queryUpstreamPermission } from '@/api/api-user';
import { getCollaborationPermissions } from '@/api/api-collaboration';
import { COLLABORATIONPERMISSION } from '@/data/query';

const routes = [
  {
    path: '/',
    redirect: '/zh',
  },
  { path: '/zh', name: 'home', component: () => import('@/views/home/TheHome.vue') },
  {
    path: '/zh/field',
    name: 'field',
    component: () => import('@/views/field/TheField.vue'),
  },
  {
    path: '/zh/field/detail',
    name: 'field-detail',
    component: () => import('@/views/field/TheFieldDetail.vue'),
  },
  {
    path: '/zh/rpm',
    name: 'rpm',
    component: () => import('@/views/package/TheRpm.vue'),
  },
  {
    path: '/zh/upstream',
    name: 'upstream',
    component: () => import('@/views/upstream/TheUpstream.vue'),
  },
  {
    path: '/zh/search',
    name: 'search',
    component: () => import('@/views/search/TheSearch.vue'),
  },
  {
    path: '/zh/image',
    name: 'image',
    component: () => import('@/views/image/TheImage.vue'),
  },
  // {
  //   path: '/zh/epkg',
  //   name: 'epkg',
  //   component: () => import('@/views/epkg/TheEpkg.vue'),
  // },
  // {
  //   path: '/zh/epkg/detail',
  //   name: 'epkg-detail',
  //   component: () => import('@/views/epkg/TheEpkgDetail.vue'),
  // },
  {
    path: '/zh/oepkg',
    name: 'oepkg',
    component: () => import('@/views/oepkg/TheOEpkg.vue'),
  },
  {
    path: '/zh/oepkg/detail',
    name: 'oepkg-detail',
    component: () => import('@/views/oepkg/TheOEpkgDetail.vue'),
  },
  {
    path: '/zh/rpm/detail',
    name: 'rpm-detail',
    component: () => import('@/views/package/TheRpmDetail.vue'),
  },
  {
    path: '/zh/image/detail',
    name: 'image-detail',
    component: () => import('@/views/image/TheImageDetail.vue'),
  },
  {
    path: '/zh/solution/openhpc',
    name: 'openhpc',
    component: () => import('@/views/solution/TheOpenHPC.vue'),
  },
  {
    path: '/zh/solution/openstack',
    name: 'openstack',
    component: () => import('@/views/solution/TheOpenStack.vue'),
  },
  {
    path: '/zh/collaboration',
    name: 'collaboration',
    component: () => import('@/views/collaboration/TheCollaboration.vue'),
  },
  {
    path: '/zh/collaboration-permission',
    name: 'collaboration-permission',
    component: () => import('@/views/collaboration/CollaborationPermission.vue'),
  },
  {
    path: '/zh/todo/:type',
    name: 'todo',
    component: () => import('@/views/todo/TheTodo.vue'),
  },
  {
    path: '/zh/todo/:type/:id',
    name: 'todo-detail',
    component: () => import('@/views/todo/TheTodoDetail.vue'),
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
  const isPlatform = COLLABORATIONPERMISSION.includes(to.name as string);
  const loginStore = useLoginStore();

  if (loginStore.isLogined) {
    if (isUpstream) {
      return userInfoStore.upstreamPermission ? true : { name: 'notFound' };
    }
    if (isPlatform) {
      return userInfoStore.platformPermissions?.length ? true : { name: 'notFound' };
    }

    return true;
  }

  await tryLogin();

  // 没登陆、没权限 直接404
  if (!loginStore.isLogined && (isUpstream || isPlatform)) {
    return { name: 'notFound' };
  }

  if (userInfoStore.upstreamPermission === null && loginStore.isLogined && !isPlatform) {
    try {
      const { data } = await queryUpstreamPermission();
      if (data.allow_access) {
        userInfoStore.upstreamPermission = data.allow_access;
      }
    } catch {
      userInfoStore.upstreamPermission = false;
    }
  }


  // 协作平台权限
  if ((userInfoStore.platformPermissions === null) && loginStore.isLogined) {
    try {
      const { data } = await getCollaborationPermissions();

      if (data.permissions.length > 0) {
        userInfoStore.platformPermissions = data.permissions;
      } else {
        return isPlatform ? { name: 'collaboration-permission' } : true;
      }

    } catch {
      return isPlatform ? { name: 'collaboration-permission' } : true;
    }
  }

  return true;
});

router.afterEach(() => {
  useViewStore().$patch({ notFoundPage: false });
});

export default router;
