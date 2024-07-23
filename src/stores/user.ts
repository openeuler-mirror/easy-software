import type { UserInfoT } from '@/@types/type-user';
import { defineStore } from 'pinia';

/**
 * 用户基本信息
 */
export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      photo: '',
      username: '',
      upstreamPermission: false,
    }
  },
  actions: {
    setUserInfo(data: UserInfoT) {
      this.photo = data.photo || '';
      this.username = data.username || '';
    },
  }
});
