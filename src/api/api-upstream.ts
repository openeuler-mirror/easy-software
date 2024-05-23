import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';



// export function getUpstream(name: string) {
//   const url = `/monitoring/api/v2/projects/?name=${name}`;
//   return request.get(url).then((res: AxiosResponse) => res?.data);
// }

export interface PkgPageSizeT {
  pageNum?: number;
  pageSize?: number;
  eulerOsVersion: string;
}


/**
 * 上游兼容应用全景
 * @name getUpstream 
 */

export function getUpstream(params: PkgPageSizeT) {
  const url = `/api-query/appVersion`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}


export function getUpstreamColumn(name: string) {
  const url = `/api-query/appVersion/column?column=${name}`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}

