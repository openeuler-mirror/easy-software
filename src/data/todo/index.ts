export const applicationColumns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '审批人', key: 'administrator', type: 'administrator' },
  { label: '审批意见', key: 'comment', type: 'comment' },
  { label: '申请单号', key: 'applyIdString', type: 'applyId' },
  { label: '申请时间', key: 'updateAt', type: 'updateAt' },
  { label: '操作', key: 'operation', type: 'operation' },
]

export const approvalColumns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请人', key: 'maintainer', type: 'maintainer' },
  { label: '申请单号', key: 'applyIdString', type: 'applyId' },
  { label: '申请时间', key: 'updateAt', type: 'updateAt' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '操作', key: 'operation', type: 'operation' },
]

export const approvalHistoryColumns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '审批意见', key: 'comment', type: 'comment' },
  { label: '申请人', key: 'maintainer', type: 'maintainer' },
  { label: '申请单号', key: 'applyIdString', type: 'applyId' },
  { label: '审批时间', key: 'updateAt', type: 'updateAt' },
  { label: '审批状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '操作', key: 'operation', type: 'operation' },
]

// 申请状态
export const applyStatusType = [
  { label: '待审批', value: 'OPEN' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已撤销', value: 'REVOKED' },
]

// 申请类型
export const applicationType = [
  {
    id: 'cveStatus',
    label: 'CVE状态',
    children: ['有CVE且全部未修复', '有CVE部分修复', '有CVE且全部修复', '没有CVE问题'],
  },
  {
    id: 'issueStatus',
    label: 'Issue状态',
    children: ['没有Issue修复', '有部分Issue修复', '全部Issue修复'],
  },
  {
    id: 'prStatus',
    label: '软件包更新状态',
    children: ['没有PR提交', '有PR提交未合入', '有PR合入'],
  },
  {
    id: 'versionStatus',
    label: '软件包版本状态',
    children: ['版本正常', '落后版本'],
  },
  {
    id: 'orgStatus',
    label: '贡献组织状态',
    children: ['贡献组织多', '贡献组织少'],
  },
  {
    id: 'contributorStatus',
    label: '贡献人员状态',
    children: ['贡献人员多', '贡献人员少'],
  },
];
// 能申请的类型
export const applicationTypeCurrent = [
  {
    id: 'cveStatus',
    label: 'CVE状态',
    children: ['有CVE且全部未修复', '有CVE部分修复', '有CVE且全部修复', '没有CVE问题'],
  },
  {
    id: 'versionStatus',
    label: '软件包版本状态',
    children: ['版本正常', '落后版本'],
  },
];


export const kindTypes = ['everything-exclude-baseos', 'epol', 'baseos']

