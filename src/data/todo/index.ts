export const applicationColumns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '审批人', key: 'adminstrator', type: 'adminstrator' },
  { label: '审批意见', key: 'maintainer', type: 'maintainer' },
  { label: '申请单号', key: 'applyId', type: 'applyId' },
  { label: '申请时间', key: 'updateAt', type: 'updateAt' },
  { label: '操作', key: 'operation', type: 'operation' },
]

export const approvalColumns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请人', key: 'maintainer', type: 'maintainer' },
  { label: '申请单号', key: 'applyId', type: 'applyId' },
  { label: '申请时间', key: 'updateAt', type: 'updateAt' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '操作', key: 'operation', type: 'operation' },
]

export const approvalHistoryColumns = [
  { label: '软件仓库', key: 'name', type: 'name' },
  { label: '申请类型', key: 'type', type: 'type' },
  { label: '修改状态', key: 'sig', type: 'sig' },
  { label: '审批意见', key: 'cve', type: 'cve' },
  { label: '申请人', key: 'issue', type: 'issue' },
  { label: '申请单号', key: 'pkg', type: 'pkg' },
  { label: '审批时间', key: 'version', type: 'version' },
  { label: '审批状态', key: 'member', type: 'member' },
  { label: '操作', key: 'operation', type: 'operation' },
]


export const applyStatus = {
  OPEN: '待审批',
  REJECTED: '已驳回',
  APPROVED: '已通过',
  REVOKED: '已撤销',
};