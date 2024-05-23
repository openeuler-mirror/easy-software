import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { ResponseT } from '@/@types/response';


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
  const url = '/dsapi/query/nps?community=software';
  return request.post(url, params).then((res: AxiosResponse) => res?.data);
}
