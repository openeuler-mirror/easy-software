import { createRouter, createWebHistory } from 'vue-router';

import { scrollToTop } from '@/utils/common';
import { useLangStore, useViewStore } from '@/stores/common';
import { tryLogin } from '@/shared/login';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { getCollaborationPermissions } from '@/api/api-collaboration';
import { COLLABORATIONPERMISSION } from '@/data/query';
import i18n from '@/i18n';

const { t } = i18n.global;

const TITLE = 'openEuler 软件中心';

const routes = [
  {
    path: '/',
    redirect: '/zh',
  },
  {
    path: '/zh',
    name: 'home',
    component: () => import('@/views/home/TheHome.vue'),
    meta: {
      title: TITLE,
    },
  },
  {
    path: '/zh/field',
    name: 'field',
    component: () => import('@/views/field/TheField.vue'),
    meta: {
      title: `${t('software.all')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/field/detail',
    name: 'field-detail',
    component: () => import('@/views/field/TheFieldDetail.vue'),
    meta: {
      title: `${t('software.all')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/rpm',
    name: 'rpm',
    component: () => import('@/views/package/TheRpm.vue'),
    meta: {
      title: `${t('software.rpm')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/upstream',
    name: 'upstream',
    component: () => import('@/views/upstream/TheUpstream.vue'),
    meta: {
      title: `${t('software.appversion')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/search',
    name: 'search',
    component: () => import('@/views/search/TheSearch.vue'),
    meta: {
      title: `${t('software.searcResult')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/image',
    name: 'image',
    component: () => import('@/views/image/TheImage.vue'),
    meta: {
      title: `${t('software.image')} | ${TITLE}`,
    },
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
    meta: {
      title: `${t('software.oepkg')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/oepkg/detail',
    name: 'oepkg-detail',
    component: () => import('@/views/oepkg/TheOEpkgDetail.vue'),
    meta: {
      title: `${t('software.oepkg')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/rpm/detail',
    name: 'rpm-detail',
    component: () => import('@/views/package/TheRpmDetail.vue'),
    meta: {
      title: `${t('software.rpm')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/image/detail',
    name: 'image-detail',
    component: () => import('@/views/image/TheImageDetail.vue'),
    meta: {
      title: `${t('software.image')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/conda',
    name: 'conda',
    component: () => import('@/views/conda/TheConda.vue'),
    meta: {
      title: `${t('software.conda')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/conda/detail',
    name: 'conda-detail',
    component: () => import('@/views/conda/TheCondaDetail.vue'),
    meta: {
      title: `${t('software.conda')} | ${TITLE}`,
    },
  },
  {
    path: '/zh/solution/openhpc',
    name: 'openhpc',
    component: () => import('@/views/solution/TheOpenHPC.vue'),
    meta: {
      title: `OpenHPC | ${TITLE}`,
    },
  },
  {
    path: '/zh/solution/openstack',
    name: 'openstack',
    component: () => import('@/views/solution/TheOpenStack.vue'),
    meta: {
      title: `OpenStack | ${TITLE}`,
    },
  },
  {
    path: '/zh/collaboration',
    name: 'collaboration',
    component: () => import('@/views/collaboration/TheCollaboration.vue'),
    meta: {
      title: `软件维护详情 | ${TITLE}`,
    },
  },
  {
    path: '/zh/collaboration-permission',
    name: 'collaboration-permission',
    component: () => import('@/views/collaboration/CollaborationPermission.vue'),
    meta: {
      title: `软件维护详情 | ${TITLE}`,
    },
  },
  {
    path: '/zh/todo/:type',
    name: 'todo',
    component: () => import('@/views/todo/TheTodo.vue'),
    meta: {
      title: `待办中心 | ${TITLE}`,
    },
  },
  {
    path: '/zh/todo/:type/:id',
    name: 'todo-detail',
    component: () => import('@/views/todo/TheTodoDetail.vue'),
    meta: {
      title: `待办中心 | ${TITLE}`,
    },
  },
  // 默认路由
  {
    path: '/:path(.*)*',
    name: 'notFound',
    component: () => {
      return import('@/components/ResultNotFound.vue');
    },
    meta: { title: `404 | ${TITLE}` },
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

  if (to.meta.title) {
    document.title = to.meta.title || TITLE;
  }

  // 设置语言
  const langStore = useLangStore();
  const lang = to.path.startsWith('/en') ? 'en' : 'zh';
  langStore.lang = lang;

  const userInfoStore = useUserInfoStore();
  const isPlatform = COLLABORATIONPERMISSION.includes(to.name as string);
  const loginStore = useLoginStore();

  if (loginStore.isLogined) {
    if (isPlatform) {
      return userInfoStore.platformAdminPermission || userInfoStore.platformMaintainerPermission ? true : { name: 'collaboration-permission' };
    }

    return true;
  }

  await tryLogin();
  loginStore.loginStatusChecked = true;

  // 协作平台权限
  if ((userInfoStore.platformMaintainerPermission === null || userInfoStore.platformAdminPermission === null) && loginStore.isLogined) {
    try {
      const { data } = await getCollaborationPermissions();

      if (data.permissions.length > 0) {
        userInfoStore.platformAdminPermission = data.permissions.includes('administrator') ? true : false;
        userInfoStore.platformMaintainerPermission = data.permissions.includes('maintainer') ? true : false;
      } else {
        return isPlatform ? { name: 'collaboration-permission' } : true;
      }
    } catch {
      return isPlatform ? { name: 'collaboration-permission' } : true;
    }
  }

  // 没登陆、没权限 直接404
  if (!loginStore.isLogined && isPlatform) {
    return { name: 'notFound' };
  }

  return true;
});

router.afterEach(() => {
  useViewStore().$patch({ notFoundPage: false });
});

export default router;
