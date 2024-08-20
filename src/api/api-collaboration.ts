import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';
import type { AdminAppryT, CollaborationRepoT } from '@/@types/collaboration'

// maintainer权限
export function getMaintainerPermission() {
  const url = `/server/collaboration/maintainer/permission`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}

// admin权限
export function getAdminPermission() {
  const url = `/server/collaboration/admin/permission`;
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


// 待我审批
export function getAdminApply(params: AdminAppryT) {
  const url = `/server/collaboration/admin/query/apply`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}
// 审批
export function getAdminRecords(id: number) {
  const url = `/server/collaboration/admin/query/records?applyId=${id}`;
  return request.get(url).then((res: AxiosResponse) => res?.data);
}



// 我的申请
export function getMaintainerApply(params: AdminAppryT) {
  const url = `/server/collaboration/maintainer/query/apply`;
  return request.get(url, { params }).then((res: AxiosResponse) => res?.data);
}

// 申请撤销
export function getMaintainerRevoke(id: number) {
  const url = `/server/collaboration/maintainer/revoke`;
  return request.post(url, { applyId: id }).then((res: AxiosResponse) => res?.data);
}


interface FeedbackT {
  repo: string;
  metric: string;
  metricStatus: string;
  description: string;
  applyStatus: string;
}

export function getApplyFeedback(params: FeedbackT) {
  const url = `/server/collaboration/maintainer/apply`;
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