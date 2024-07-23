import type { ResponseT } from '@/@types/response';
import type { UserInfoT } from '@/@types/type-user';
import { request } from '@/shared/axios';
import { getCsrfToken } from '@/shared/login';

interface UserPermissionResponseT {
  msg: string;
  code: number;
  data: UserInfoT;
}

/**
 * 获取用户信息
 * @param community community字段，默认openeuler
 * @returns {Promise<UserInfoT>} 用户信息
 */
export function queryUserInfo(community = 'openeuler') {
  const url = '/api-id/oneid/user/permission';
  const token = getCsrfToken();
  return request
    .get<UserPermissionResponseT>(url, {
      params: { community },
      global: true,
      headers: { token },
    })
    .then((res) => res.data.data);
}

export function queryUpstreamPermission() {
  const url = '/server/appVersion/permission';
  return request.get<ResponseT<{ allow_access: boolean }>>(url).then((res) => res.data);
}