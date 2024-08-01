import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { SearchUpstreamT } from '@/@types/domain';

/**
 * 上游兼容应用全景
 * @name getUpstream
 */

export function getUpstream(params: SearchUpstreamT) {
  const url = `/server/appVersion`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}

export function getUpstreamColumn(name: string) {
  const url = `/server/appVersion/column?column=${name}`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}
