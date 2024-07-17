import type { UserInfoT } from '@/@types/type-user';
import { request } from '@/shared/axios';
import { getUserToken } from '@/shared/login';

/**
 * 获取用户信息
 * @param community community字段，默认openeuler
 * @returns {Promise<UserInfoT>} 用户信息
 */
export function queryUserInfo(community = 'openeuler') {
  const url = '/api-omapi/oneid/user/permission';
  const token = getUserToken();
  return request
    .get<UserInfoT>(url, {
      params: { community },
      global: true,
      headers: { token },
    })
    .then((res) => res.data);
}