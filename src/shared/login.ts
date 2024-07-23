import Cookies from 'js-cookie';
import { useLangStore } from '@/stores/common';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL;

export const LOGIN_KEYS = {
  CSRF_TOKEN: '_U_T_',
  USER_INFO: '_U_I_',
};

/**
 * 从cookie中获取csrfToken
 * @returns csrfToken
 */
export const getCsrfToken = () => Cookies.get(LOGIN_KEYS.CSRF_TOKEN) || '';

// 退出登录
export function logout() {
  location.href = `${LOGIN_URL}/logout?redirect_uri=${encodeURIComponent(window?.location?.origin)}`;
}

/**
 * 跳转登录页
 */
export function doLogin() {
  location.href = `${LOGIN_URL}/login?redirect_uri=${encodeURIComponent(location.href)}&lang=${useLangStore().lang}`;
}
