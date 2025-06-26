import { PACKAGE_TYPE_MAPPING, FLITERMENUOPTIONS } from '@/data/query';

import { isString } from '@opensig/opendesign';

/**
 * 判断搜索 tab 参数是否有效
 * @param {unknown} val 待判断 tab 参数
 * @returns {(boolean|Object)} 有效返回对应的 tab 对象，无效返回 false
 */
export function isValidSearchTabName(val: unknown) {
  if (!isString(val)) {
    return false;
  }
  return PACKAGE_TYPE_MAPPING[val as keyof typeof PACKAGE_TYPE_MAPPING] || false;
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
