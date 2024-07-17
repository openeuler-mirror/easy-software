import type { UserInfoT } from '@/@types/type-user';
import { request } from '@/shared/axios';
import { getCsrfToken } from '@/shared/login';

const VITE_LOGIN_URL = import.meta.env.VITE_LOGIN_URL;

/**
 * 获取用户信息
 * @param community community字段，默认openeuler
 * @returns {Promise<UserInfoT>} 用户信息
 */
export function queryUserInfo(community = 'openeuler') {
  const url = '/oneid/user/permission';
  const token = getCsrfToken();
  return request
    .get<UserInfoT>(url, {
      baseURL: VITE_LOGIN_URL,
      params: { community },
      global: true,
      headers: { token },
    })
    .then((res) => res.data);
}
