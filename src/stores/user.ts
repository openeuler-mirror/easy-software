import type { UserInfoT } from '@/@types/type-user';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

/**
 * 用户基本信息
 */
export const useUserInfoStore = defineStore('userInfo', () => {
  // 登录信息
  const userInfo = reactive<UserInfoT>({
    photo: '',
    username: '',
  });
  const setUserInfo = (data?: typeof userInfo) => {
    if (!data) {
      return;
    }
    userInfo.photo = data.photo || '';
    userInfo.username = data.username || '';
  };
  const clearUserInfo = () => {
    userInfo.photo = '';
    userInfo.username = '';
  };
  return { userInfo, setUserInfo, clearUserInfo };
});
