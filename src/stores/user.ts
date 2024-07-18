import type { UserInfoT } from '@/@types/type-user';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 用户基本信息
 */
export const useUserInfoStore = defineStore('userInfo', () => {
  // 登录信息
  const photo = ref('');
  const username = ref('');
  const setUserInfo = (data?: UserInfoT) => {
    if (!data) {
      return;
    }
    photo.value = data.photo || '';
    username.value = data.username || '';
  };
  const clearUserInfo = () => {
    photo.value = '';
    username.value = '';
  };
  return { photo, username, setUserInfo, clearUserInfo };
});
