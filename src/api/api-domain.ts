import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { SearchSQLT } from '@/@types/domain';


interface ColumnT {
  name: string;
  column: string;
}

export function getStat() {
  const url = `/api-query/field/stat`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}

interface DetailT {
  appPkgId: string;
  epkgPkgId: string;
  rpmPkgId: string;
}
export function getDetail(params: DetailT) {
  const url = `/api-query/field/detail`;
  return request.get(url, { showError: false, params }).then((res: AxiosResponse) => res?.data);
}

// 领域应用
export function getSearchAllColumn(params: ColumnT) {
  const url = `/api-query/field/column`;
  return request.get(url, { showError: false, params }).then((res: AxiosResponse) => res?.data);
}

export function getSearchAllFiled(params: SearchSQLT) {
  const url = `/api-query/field`;
  return request.get(url, { showError: false, params }).then((res: AxiosResponse) => res?.data);
}

//Tags

export function getTags(id: string) {
  const url = `/api-query/apppkg/tags?name=${id}`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}

//详情页

export function getDetails(tabValue: string, id: string) {
  const url = `/api-query/${tabValue}?pkgId=${id}`;
  return request.get(url, { showError: false }).then((res: AxiosResponse) => res?.data);
}

//支持情况

export function getVer(tabValue: string, id: string) {
  const url = `/api-query/${tabValue}/eulerver?name=${id}`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}