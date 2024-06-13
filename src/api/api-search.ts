import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { SearchESParamsT } from '@/@types/domain';

import { DOCS_SEARCH_API } from '@/data/config';

/**
 * 搜索
 * @name getSearchData
 * @param {Object} params
 * @param {string} params.keyword - 关键字
 * @param {number} params.pageNum  - 分页
 * @param {number} params.pageSize - 分页数量
 * @param {string} params.dataType - 过滤
 * @return {Promise<ResponseT<string>>}  返回一个 Promise，解析为提交的反馈信息是否成功的反馈信息
 */

export function getSearchData(params: SearchESParamsT) {
  const url = DOCS_SEARCH_API + '/software/docs';
  return request.post(url, params).then((res: AxiosResponse) => res?.data);
}


export function getSearchCount(params: {
  keyword: string
}) {
  const url = DOCS_SEARCH_API + '/api-search/software/count';
  return request.post(url, params).then((res: AxiosResponse) => res?.data);
}

export function getSearchDataAll(params: SearchESParamsT) {
  const url = DOCS_SEARCH_API + '/api-search/software/docsAll';
  return request.post(url, params).then((res: AxiosResponse) => res?.data);
}
