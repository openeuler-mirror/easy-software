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