import { TAGS_OPTIONS, TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';

import { isString } from '@opensig/opendesign';

/**
 * 判断 tags 参数是否有效
 * @param {unknown} val 待判断 tags 参数
 * @returns {(boolean|Object)} 有效返回对应的 tags 对象，无效返回 false
 */
export function isValidTags(val: unknown) {
  if (!isString(val)) {
    return false;
  }
  return TAGS_OPTIONS.find((option: string) => option === val);
}

/**
 * 判断搜索 tab 参数是否有效
 * @param {unknown} val 待判断 tab 参数
 * @returns {(boolean|Object)} 有效返回对应的 tab 对象，无效返回 false
 */
export function isValidSearchTabName(val: unknown) {
  if (!isString(val)) {
    return false;
  }
  return TABNAME_OPTIONS.find((option: string) => option === val);
}

/**
 * 判断搜索 tab 参数是否有效
 * @param {unknown} val 待判断 tab 参数
 * @returns {(boolean|Object)} 有效返回对应的 tab 对象，无效返回 false
 */
export function isValidSearchKey(val: unknown) {
  if (!isString(val)) {
    return false;
  }
  return FLITERMENUOPTIONS.find((option) => option.id === val);
}
