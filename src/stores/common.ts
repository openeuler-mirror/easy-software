import { getCustomCookie } from '@/utils/cookie';
import { defineStore } from 'pinia';

// 语言
export const useLangStore = defineStore('lang', {
  state: () => {
    return {
      lang: '',
    };
  },
  actions: {
    setLangStore(val: string) {
      this.lang = val;
    },
  },
});

/**
 * 页面状态
 */
export const useViewStore = defineStore('view', {
  state: () => {
    return {
      notFoundPage: false,
      noPermission: false,
    };
  },
  actions: {
    showNotFound() {
      this.notFoundPage = true;
    },
  },
});

export const useAppearance = defineStore('appearance', {
  state: () => ({
    theme: 'light',
  }),
});

export const COOKIE_AGREED_STATUS = {
  NOT_SIGNED: '0', // 未签署
  ALL_AGREED: '1', // 同意所有cookie
  NECCESSARY_AGREED: '2', // 仅同意必要cookie
};

export const COOKIE_KEY = 'agreed-cookiepolicy';

export const useCookieStore = defineStore('cookie', {
  state: () => ({
    status: COOKIE_AGREED_STATUS.NOT_SIGNED,
  }),
  getters: {
    isAllAgreed: (state) => state.status === COOKIE_AGREED_STATUS.ALL_AGREED,
  },
  actions: {
    getUserCookieStatus() {
      const cookieVal = getCustomCookie(COOKIE_KEY) ?? '0';
      const cookieStatusVal = cookieVal[0];
      if (cookieStatusVal === COOKIE_AGREED_STATUS.ALL_AGREED) {
        this.status = COOKIE_AGREED_STATUS.ALL_AGREED;
      } else if (cookieStatusVal === COOKIE_AGREED_STATUS.NECCESSARY_AGREED) {
        this.status = COOKIE_AGREED_STATUS.NECCESSARY_AGREED;
      } else {
        this.status = COOKIE_AGREED_STATUS.NOT_SIGNED;
      }
      return this.status;
    },
  },
});
