import { OpenAnalytics, OpenEventKeys, getClientInfo } from '@opensig/open-analytics';
import { reportAnalytics } from '@/api/api-analytics';
import type { Awaitable } from '@vueuse/core';
import { COOKIE_AGREED_STATUS, useCookieStore } from '@/stores/common';
import router from '@/router';
import { useLoginStore } from '@/stores/user';

export const oa = new OpenAnalytics({
  appKey: 'openEuler',
  request: (data) => {
    if (useCookieStore().getUserCookieStatus() !== COOKIE_AGREED_STATUS.ALL_AGREED) {
      return disableOA();
    }
    reportAnalytics(data);
  },
});

let reportPerfCount = 0;
let routerGuardCancelFuncs: (() => void)[];

const setupRouterGuards = () => {
  router.isReady().then(() => {
    reportPV();
    (routerGuardCancelFuncs ??= []).push(
      router.beforeEach((to, from) => {
        if (from.path === '/' || to.path === from.path) {
          return;
        }
        to.meta.$referrer = window.location.href;
      }),
      router.afterEach((to, from) => {
        if (to.path === from.path) {
          return;
        }
        reportPV(to.meta.$referrer as string);
      })
    );
  });
};

export const enableOA = () => {
  oa.setHeader(getClientInfo());
  oa.enableReporting(true);
  setupRouterGuards();
  if (reportPerfCount >= 1) {
    return;
  }
  reportPerfCount++;
  reportPerformance();
};

export const disableOA = () => {
  oa.enableReporting(false);
  if (routerGuardCancelFuncs) {
    routerGuardCancelFuncs.forEach((item) => item());
    routerGuardCancelFuncs = [];
  }
  ['oa-openEuler-client', 'oa-openEuler-events', 'oa-openEuler-session'].forEach((key) => {
    localStorage.removeItem(key);
  });
};

type Service = 'software' | 'search_software'

export const getReportFn = ($service: Service = 'software') => {
  return (
    event: string,
    data?: Record<string, any> | ((...opt: any[]) => Awaitable<Record<string, any>>),
    options?: {
      immediate?: boolean;
      eventOptions?: any;
    }
  ) => {
    if (!oa.enabled) {
      return;
    }
    const loginStore = useLoginStore();
    return oa.report(
      event,
      async () => ({
        $service,
        loginStatus: loginStore.isLogined,
        ...(typeof data === 'function' ? await data() : data),
      }),
      options
    );
  };
};

export const searchReport = getReportFn('search_software');
export const oaReport = getReportFn();

export const reportPV = ($referrer?: string) => {
  oaReport(OpenEventKeys.PV, $referrer ? { $referrer } : undefined);
};

export const reportPerformance = () => {
  oaReport(OpenEventKeys.LCP);
  oaReport(OpenEventKeys.INP);
  oaReport(OpenEventKeys.PageBasePerformance);
};
