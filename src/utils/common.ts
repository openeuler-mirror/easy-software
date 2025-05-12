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
    conda: CandaIcon
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
export const checkOriginLink = (path: string) => {
  return path.includes('openeuler.org');
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
    conda: 'conda'
  };
  return nameMap[type] || '';
};

// 是否是搜索页面
import { useRoute } from 'vue-router';
const route = useRoute();
export const isSearchPage = () => {
  return route.name === 'search';
};

// 去重

export const getTarget = (data: any, key: any) => {
  const map = new Map();
  for (const item of data) {
    if (!map.has(item[key])) {
      map.set(item[key], item);
    }
  }
  return [...map.values()];
};

// 输入框文字校验
export const inputValidator = new RegExp('^[\u4E00-\u9FA5A-Za-z0-9.()$\\-]+$');

/**
 * 对象转URL参数
 * @param queries 要转成query的键值对
 * @returns query字符串，如?key1=value1&key2=value2
 */
export const generateQuery = (queries: Record<string, any>): string => {
  const parseResultArr = Object.entries(queries).reduce((arr, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return arr;
    }
    arr.push(`${key}=${value}`);
    return arr;
  }, [] as string[]);
  if (parseResultArr?.length) {
    return `?${parseResultArr.join('&')}`;
  }
  return '';
};

/**
 * 获取指定时区偏移量的年份
 * @param {number} offset - 时区偏移量（单位：小时）。例如，UTC+8 时区，传入 8。
 * @returns {number} - 指定时区偏移量对应的年份
 */
export const getYearByOffset = () => {
  // 获取当前时间的 UTC 时间
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  // 设置偏移
  utcTime.setHours(utcTime.getHours() + 8);

  return utcTime.getFullYear();
};
