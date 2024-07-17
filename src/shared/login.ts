import Cookies from 'js-cookie';
import { queryUserInfo } from '../api/api-user';
import { useUserInfoStore } from '../stores/user';
import type { UserInfoT } from '@/@types/type-user';
import { useLangStore } from '@/stores/common';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL;

export const LOGIN_KEYS = {
  USER_TOKEN: '_U_T_',
  USER_INFO: '_U_I_',
};

/**
 * 从cookie中获取用户token，_U_T_
 * @returns 用户token
 */
export const getUserToken = () => Cookies.get(LOGIN_KEYS.USER_TOKEN) || '';

// 退出登录
export function logout() {
  location.href = `${LOGIN_URL}/logout?redirect_uri=${encodeURIComponent(window?.location?.origin)}`;
}

// 跳转首页
export function goToHome() {
  window?.location?.reload();
}

/**
 * 跳转登录页
 */
export function doLogin() {
  location.href = `${LOGIN_URL}/login?redirect_uri=${encodeURIComponent(location.href)}&lang=${useLangStore().lang}`;
}

// token失效跳转首页
export function tokenFailIndicateLogin() {
  Cookies.remove(LOGIN_KEYS.USER_TOKEN);
  useUserInfoStore().clearUserInfo();
  goToHome();
}

const setSessionInfo = (data?: UserInfoT) => {
  const { username, photo } = data || {};
  if (username && photo) {
    sessionStorage.setItem(LOGIN_KEYS.USER_INFO, JSON.stringify({ username, photo }));
  }
};

/**
 * 从sessionStorage移除用户信息
 */
const removeSessionInfo = () => sessionStorage.removeItem(LOGIN_KEYS.USER_INFO);

/**
 * 从sessionStorage获取用户信息
 */
const getUserInfoFromSessionStorage = () => {
  const info = sessionStorage.getItem(LOGIN_KEYS.USER_INFO);
  if (!info) {
    return;
  }
  try {
    const userInfo: UserInfoT = JSON.parse(info) || {};
    if (userInfo.username && userInfo.photo) {
      return userInfo;
    }
  } catch (error) {
    return;
  }
};

/**
 * 刷新后页面后store内参数被清除，重新请求登录用户信息
 */
export function refreshUserInfo() {
  const token = getUserToken();
  if (token) {
    const { setUserInfo } = useUserInfoStore();
    setUserInfo(getUserInfoFromSessionStorage());
    queryUserInfo().then(userInfo => {
      useUserInfoStore().setUserInfo(userInfo);
      setSessionInfo(userInfo);
    });
  } else {
    removeSessionInfo();
  }
}

