import { defineStore } from 'pinia';

/**
 * 搜索》首字母排序
 */
export const useSearchStore = defineStore('serach', {
  state: () => {
    return {
      nameOrder: false,
      count: 0,
    };
  },
  actions: {
    changeNameOrderState(v: boolean) {
      this.nameOrder = v;
    },
    changeNameOrderCount(v: number) {
      this.count = v;
    },
  },
});
