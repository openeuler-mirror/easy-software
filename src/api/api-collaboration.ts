import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { AdminAppryT, CollaborationRepoT, RevokeT } from '@/@types/collaboration';

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
 * 获取仓库/sig列表
 */
export function getRepoSigList(permission: string): Promise<{ sigs: string[]; repos: string[] }> {
  const url = `/server/collaboration/${permission}/query/repos`;
  return request.get<{ data: Record<string, string> }>(url).then((res) => ({ sigs: Object.values(res.data.data), repos: Object.keys(res.data.data) }));
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

export function getMaintainerRevoke(params: RevokeT) {
  const url = `/server/collaboration/maintainer/revoke`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}

export function getAdminRevoke(params: RevokeT) {
  const url = `/server/collaboration/admin/revoke`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}

/** 待办中心获取我的申请所有仓库 */
export function getMaintainerApplyRepos() {
  const url = `/server/collaboration/maintainer/apply/repos`;
  return request.get<{ data: { total: number, list: string[] } }>(url).then((res) => res?.data.data);
}

/** 待办中心获取待我审批/我审批过所有仓库 */
interface ReposT {
  apply_status: string
}
export function getAdminApplyRepos(params: ReposT) {
  const url = `/server/collaboration/admin/apply/repos`;
  return request.get(url, { params }).then((res) => res?.data.data);
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

export function getAdminApplyFeedback(params: FeedbackT) {
  const url = `/server/collaboration/admin/apply?repo=${params.repo}`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}


interface ProcessT {
  applyIdString: string;
  comment: string;
  applyStatus: string;
}

export function getAdminProcess(params: ProcessT) {
  const url = `/server/collaboration/admin/process`;
  return request.post(url, { ...params }).then((res: AxiosResponse) => res?.data);
}
