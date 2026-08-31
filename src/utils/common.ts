import { isClient } from '@opensig/opendesign';
import xss from 'xss';
/**
 * safe window open
 */
export const windowOpen = (url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) => {
  const opener = window.open(url, target, features);
  opener && (opener.opener = null);
};

// 去除搜索结果span标签
export const xssAllTag = (str: string) => {
  return xss(str, {
    whiteList: {}, // 白名单为空，表示过滤所有标签
    stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
    stripIgnoreTagBody: ['script'], // script标签较特殊，需要过滤标签中间的内容
  });
};

/**
 * 日期转 xxxx/xx/xx 格式时间
 * @param {v}  待转换时间
 * @param {isTime:boolean} 返回格式 2024/01/01 01:00
 * @returns {string} 返回格式化时间，如 2024/01/01
 */
export const formatDateTime = (v: string, isTime?: boolean) => {
  if (v) {
    const date = new Date(v);

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    if (isTime) {
      const hh = ('0' + date.getHours()).slice(-2);
      const mm = ('0' + date.getMinutes()).slice(-2);

      return `${year}/${month}/${day} ${hh}:${mm}`;
    }

    return `${year}/${month}/${day}`;
  }
  return '-';
};

/**
 * 滚动至顶部
 * @param {number} top 滑动到的顶部
 * @param {boolean} smooth 是否平滑滑动
 */
export const scrollToTop = (top: number = 0, smooth: boolean = true) => {
  if (isClient) {
    const dom = document.querySelector('#app > .o-scroller > .o-scroller-container');
    dom?.scrollTo({
      top,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }
};

import EpkgIcon from '~icons/pkg/epkg.svg';
import ImageIcon from '~icons/pkg/image.svg';
import RpmIcon from '~icons/pkg/rpm.svg';
import OepkgIcon from '~icons/pkg/oepkg.svg';
import CandaIcon from '~icons/pkg/conda.svg';
import PypiIcon from '~icons/pkg/pypi.svg';
import NpmIcon from '~icons/pkg/npm.svg';
import SourceInstallIcon from '~icons/pkg/source-install.svg';

export const getTagsIcon = (v: string) => {
  const iconMap: Record<string, any> = {
    RPM: RpmIcon,
    rpmpkg: RpmIcon,
    EPKG: EpkgIcon,
    epkgpkg: EpkgIcon,
    IMAGE: ImageIcon,
    apppkg: ImageIcon,
    OEPKG: OepkgIcon,
    oepkg: OepkgIcon,
    CONDA: CandaIcon,
    conda: CandaIcon,
    PYPI: PypiIcon,
    pypipkg: PypiIcon,
    pypi: PypiIcon,
    NPM: NpmIcon,
    npmpkg: NpmIcon,
    npm: NpmIcon,
    SOURCE: SourceInstallIcon,
    sourcepkg: SourceInstallIcon,
    source: SourceInstallIcon,
  };
  return iconMap[v];
};

//提取code
export const getCode = (code: string) => {
  const codeRegex = /<code>(.*?)<\/code>/;
  const match = JSON.stringify(code).match(codeRegex);
  if (match) {
    // 如果匹配成功，则输出匹配到的内容
    const codeContent = match[1].replace(/\\n/g, '');
    return codeContent;
  }
};

// 检查是否是同域名
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;
export const checkOriginLink = (path: string) => {
  return path.includes(COOKIE_DOMAIN);
};

/**
 * 过滤空参数
 * @param {data} any 地址
 * @returns {object} 成功返回参数对象
 */

export const getParamsRules = (data: any) => {
  type ParamsKeyT = keyof any;

  type NewDataT = {
    [x: string]: any;
  };

  const newData: NewDataT = {};
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof ParamsKeyT];
    if (value) {
      newData[key] = value;
    }
  });
  return newData;
};

// 返回名称参数
export const getPkgName = (type: string) => {
  const nameMap: Record<string, string> = {
    apppkg: 'image',
    epkgpkg: 'epkg',
    rpmpkg: 'rpm',
    oepkg: 'oepkg',
    all: 'filed',
    condapkg: 'conda',
    conda: 'conda',
    pypipkg: 'pypi',
    pypi: 'pypi',
    npmpkg: 'npm',
    npm: 'npm',
    sourcepkg: 'source',
    source: 'source',
  };
  return nameMap[type] || '';
};

// 定义期望顺序的映射对象
export const pkgSortMap = {
  RPM: 1,
  rpmpkg: 1,
  IMAGE: 2,
  apppkg: 2,
  OEPKG: 3,
  oepkg: 3,
  CONDA: 4,
  conda: 4,
  PYPI: 5,
  pypipkg: 5,
  pypi: 5,
  NPM: 6,
  npmpkg: 6,
  npm: 6,
  SOURCE: 7,
  sourcepkg: 7,
  source: 7,
};
