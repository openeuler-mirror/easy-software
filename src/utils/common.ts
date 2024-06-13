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
 * @returns {string} 返回格式化时间，如 2024/01/01
 */
export const formatDateTime = (v: string) => {
  const date = new Date(v);

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return `${year}/${month}/${day}`;
};

/**
 * 滚动至顶部
 * @param {number} top 滑动到的顶部
 * @param {boolean} mooth 是否平滑滑动
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

export const getTagsIcon = (v: string) => {
  if (v === 'RPM' || v === 'rpmpkg') {
    return RpmIcon;
  } else if (v === 'EPKG' || v === 'epkgpkg') {
    return EpkgIcon;
  } else if (v === 'IMAGE' || v === 'apppkg') {
    return ImageIcon;
  }
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
export const checkDomainLink = (path: string) => {
  return path.includes('openeuler.org');
};

/**
 * 过滤空参数
 * @param {data} any 地址
 * @returns {object} 成功返回参数对象
 */
import type { SearchSQLT, SearchESParamsT } from '@/@types/domain';
export const getParamsRules = (data: any) => {
  type ParamsKeyT = keyof SearchSQLT | SearchESParamsT;

  type NewDataT = {
    [x: string]: SearchSQLT | SearchESParamsT;
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
import type { ParamsKeyT } from '@/@types/detail';
export const getDetailRules = (data: any) => {
  const newData = {} as any;
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof ParamsKeyT];
    if (value) {
      newData[key] = value;
    }
  });
  return newData;
};
