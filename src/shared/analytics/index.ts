import { OpenAnalytics, OpenEventKeys, getClientInfo } from '@opensig/open-analytics';
import { reportAnalytics } from '@/api/api-analytics';
import type { Awaitable } from '@vueuse/core';
import { COOKIE_AGREED_STATUS, useCookieStore } from '@/stores/common';
import router from '@/router';

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

/**
 * @param event 事件名
 * @param eventData 上报数据
 * @param $service service字段取值
 * @param options options
 */
export const oaReport = <T extends Record<string, any>>(
  event: string,
  eventData?: T | ((...opt: any[]) => Awaitable<T>),
  $service = 'software',
  options?: {
    immediate?: boolean;
    eventOptions?: any;
  }
) => {
  if (!oa.enabled) {
    return;
  }
  return oa.report(
    event,
    async () => ({
      $service,
      ...(typeof eventData === 'function' ? await eventData() : eventData),
    }),
    options
  );
};

export const reportPV = ($referrer?: string) => {
  oaReport(OpenEventKeys.PV, $referrer ? { $referrer } : undefined);
};

export const reportPerformance = () => {
  oaReport(OpenEventKeys.LCP);
  oaReport(OpenEventKeys.INP);
  oaReport(OpenEventKeys.PageBasePerformance);
};
