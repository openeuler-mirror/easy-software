import { OPENEULER, OPENEULER_CONTACT } from '@/data/config';

export default {
  USER_CENTER: '个人中心',
  LOGOUT: '退出登录',
  lang: '中文',
  FOOTER: {
    ATOM_TEXT:
      'openEuler是由开放原子开源基金会孵化的全场景开源操作系统项目，面向数字基础设施四大核心场景（服务器、云计算、边缘计算、嵌入式），全面支持ARM、x86、RISC-V、loongArch、PowerPC、SW-64等多样性计算架构',
    ATOM_PC: '/atom-pc.png',
    ATOM_MO: '/atom-mo.png',
    MAIL: OPENEULER_CONTACT,
    COPY_RIGHT: '版权所有 © {year} openEuler 保留一切权利',
    LICENSED_1: '遵循',
    LICENSED_2: '木兰宽松许可证第2版（MulanPSL2）',
    RIGHT_LIST: [
      {
        NAME: '品牌',
        URL: OPENEULER + '/zh/other/brand/',
      },
      {
        NAME: '隐私政策',
        URL: OPENEULER + '/zh/other/privacy/',
      },
      {
        NAME: '法律声明',
        URL: OPENEULER + '/zh/other/legal/',
      },
    ],
    LINKS: [],
    QR_CODE: 'openEuler公众号',
    QR_ASSISTANT: 'openEuler小助手',
  },
  BUILDING: {
    BUILDING: '建设中',
    BUILDINGMES: '敬请期待...',
  },
  SEARCH: {
    BROWSEHISTORY: '历史记录',
    CLEAN: '清除',
    TOPSEARCH: '热门搜索',
    CHANGE: '换一批',
    PLEACHOLDER: '请输入内容',
  },
  PREV: '上一页',
  NEXT: '下一页',
};
