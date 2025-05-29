import i18n from '@/i18n';

const { t } = i18n.global;

// tags参数
export const TAGS_OPTIONS = ['RPM', 'IMAGE', 'EPKG', 'OEPKG', 'CONDA'];

// 搜索tab参数
export const TABNAME_OPTIONS = ['all', 'rpmpkg', 'apppkg', 'epkgpkg', 'oepkg', 'condapkg', 'appversion'];

// 搜索筛选菜单
export const FLITERMENUOPTIONS = [
  {
    id: 'all',
    name: t('software.filterAll'),
  },
  {
    id: 'name',
    name: t('software.filterName'),
  },
  {
    id: 'summary',
    name: t('software.filterSummary'),
  },
  {
    id: 'file',
    name: t('software.filterFile'),
  },
  {
    id: 'ubuntu',
    name: 'ubuntu',
  },
];

// 表格筛选
export const SORTPARAMS = {
  0: '',
  1: 'desc',
  2: 'asc',
};

// 分页器数量
export const COUNT_PAGESIZE = [10, 20, 40, 80];
export const COUNT_PAGESIZE_FIELD = [12, 24, 48, 96];

// maintainer
export const maintainerDefaults = {
  name: 'George.Cao',
  email: 'caozhi1214@qq.com',
  gitee_id: 'georgecao',
};

// 协作平台权限 route name
export const COLLABORATIONPERMISSION = ['todo', 'collaboration', 'todo-detail'];
