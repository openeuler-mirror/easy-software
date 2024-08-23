import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { AdminAppryT, CollaborationRepoT } from '@/@types/collaboration';

// 权限
export function getCollaborationPermissions() {
  const url = `/server/collaboration/maintainer/permissions`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}

// 软件维护详情 maintainer
export function getMaintainerRepos(params: CollaborationRepoT) {
  const url = `/server/collaboration/maintainer/user/repos`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}

// 软件维护详情 admin
export function getAdminRepos(params: CollaborationRepoT) {
  const url = `/server/collaboration/admin/user/repos`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}

/**
 * 获取sig列表
 */
export function getSigList() {
  const url = `/api-dsapi/query/sig/name?community=openeuler`;
  return request.get<{ data: Record<'openeuler', string[]> }>(url).then((res) => res.data.data.openeuler);
}

/**
 * 获取仓库列表
 */
export function getRepoList() {
  const url = `/api-dsapi/query/repo/sig/list?community=openeuler`;
  return request.get<{ data: Record<string, string>[] }>(url).then((res) => res.data.data.map((item) => Object.keys(item)[0]));
}

// 待我审批
export function getAdminApply(params: AdminAppryT) {
  const url = `/server/collaboration/admin/query/apply`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}


// 我的申请
export function getMaintainerApply(params: AdminAppryT) {
  const url = `/server/collaboration/maintainer/query/apply`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}

// 申请撤销
export function getMaintainerRevoke(id: number) {
  const url = `/server/collaboration/maintainer/revoke`;
  return request.post(url, { applyIdString: id }).then((res: AxiosResponse) => res?.data);
}

/** 待办中心获取我的申请所有仓库 */
export function getMaintainerApplyRepos() {
  const url = `/server/collaboration/maintainer/apply/repos`;
  return request.get<{ data: { total: number, list: string[] } }>(url).then((res) => res?.data.data);
}

/** 待办中心获取待我审批/我审批过所有仓库 */
export function getAdminApplyRepos() {
  const url = `/server/collaboration/admin/apply/repos`;
  return request.get<{ data: { total: number, list: string[] } }>(url).then((res) => res?.data.data);
}

interface FeedbackT {
  repo: string;
  metric: string;
  metricStatus: string;
  description: string;
  applyStatus: string;
}

export function getApplyFeedback(params: FeedbackT) {
  const url = `/server/collaboration/maintainer/apply?repo=${params.repo}`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}

interface ProcessT {
  applyId: string;
  comment: string;
  applyStatus: string;
}

export function getAdminProcess(params: ProcessT) {
  const url = `/server/collaboration/admin/process`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}
