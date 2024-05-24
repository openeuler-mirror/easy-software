// 容器镜像更多信息表头
export const columnTags = [
  { label: 'Tag', key: 'appVer' },
  { label: 'Architectures', key: 'arch' },
  { label: '获取镜像', key: 'dockerStr' },
];

// 容器镜像tab分类
export const tabList = ['概览', 'Tags'];

// RPM更多信息表头
export const moreColumns = [
  { label: 'Name', key: 'name', style: 'width:35%' },
  { label: 'Flags', key: 'flags', style: 'width:10%' },
  { label: 'Rel', key: 'rel', style: 'width:25%' },
  { label: 'Ver', key: 'ver' },
  { label: 'Epoch', key: 'epoch', style: 'width:12%' },
];
// 版本支持
export const verColumns =  [
  { label: 'openEuler版本', key: 'os' },
  { label: '架构', key: 'arch' , style: 'width:30%' },
  { label: '操作', key: 'flags', style: 'width:30%'   },
];;
