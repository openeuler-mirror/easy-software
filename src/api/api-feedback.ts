import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { ResponseT } from '@/@types/response';
import type { SorT } from '@/@types/type-sort';
import type { FeedbackHistoryT } from '@/@types/feedback';

interface FeedbackT {
  feedbackPageUrl: string;
  feedbackText: string;
  feedbackValue: number;
}

/**
 * 用户反馈
 * @name postFeedback
 * @param {Object} params
 * @param {string} params.feedbackPageUrl - 评分页面
 * @param {string} params.feedbackText  - 评分内容
 * @param {string} params.feedbackValue - 评分
 * @return {Promise<ResponseT<string>>}  返回一个 Promise，解析为提交的反馈信息是否成功的反馈信息
 */

export function postFeedback(params: FeedbackT): Promise<ResponseT<string>> {
  const url = '/api-dsapi/query/nps/issue?community=software';
  return request.post(url, params).then((res: AxiosResponse) => res?.data);
}

/**
 * 查询反馈历史列表
 * @param page 当前页码
 * @param pageSize 单页大小
 * @param filter 查询条件
 * @param sort 排序
 * @returns 反馈历史列表
 */
export function getFeedbackList(page?: number, pageSize?: number, filter?: string, sort?: SorT) {
  return request
    .get<ResponseT<{ total: number; data: FeedbackHistoryT[] }[]>>('/api-dsapi/query/repo/issues', {
      params: { page, pageSize, filter, sort, community: 'openeuler', repo: 'easy-software' },
      headers: { Accept: 'application/json' },
    })
    .then((res) => res?.data);
}

export function getGlobalFeedbackHistoryList(page?: number, pageSize?: number, filter?: string, sort: SorT = 'desc') {
  return request
    .get<ResponseT<{ total: number; data: FeedbackHistoryT[] }[]>>('/api-dsapi/query/get/nps', {
      params: { page, pageSize, filter, sort, community: 'openeuler', repo: 'easy-software' },
      headers: { Accept: 'application/json' },
    })
    .then((res) => res?.data.data);
}

export function postGlobalFeedback(feedbackPageUrl: string, feedbackValue: number, feedbackText: string) {
  return request.post('/api-dsapi/query/globalnps/issue?community=software', {
    feedbackPageUrl,
    feedbackValue,
    feedbackText,
  });
}