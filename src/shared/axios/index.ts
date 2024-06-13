import type { Ref } from 'vue';

import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, AxiosStatic, Canceler } from 'axios';

import handleResponse from './handleResponse';
import handleError from './handleError';
import setConfig from './setConfig';

import { isBoolean, useLoading, useMessage, isNull, isUndefined } from '@opensig/opendesign';
import type { LoadingPropsT } from '@opensig/opendesign/lib/loading/types';

interface RequestConfig<D = any> extends AxiosRequestConfig {
  data?: D;
  showLoading?: boolean | { opt?: Partial<LoadingPropsT>; wrap: Ref<HTMLElement> | HTMLElement | string }; // 加载时是否出现Loading框，默认为false
  showError?: boolean; // 请求报错是否出现错误提示，默认为true
  ignoreError?: number; // 忽略某个状态码错误提示
  ignoreDuplicates?: boolean; // false: 取消重复请求； true: 允许重复请求
  global?: boolean; // 是否为全局请求，全局请求在清除请求池时，不清除
}

interface RequestInstance extends AxiosInstance {
  removeRequestInterceptor(): void;
  removeResponseInterceptor(): void;
  clearPendingPool(whiteList: Array<string>): Array<string> | null;
  getUri(config?: RequestConfig): string;
  request<T = any, R = AxiosResponse<T>, D = any>(config: RequestConfig<D>): Promise<R>;
  get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
  delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
  head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
  options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
  post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
  put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
  patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
}

interface InternalRequestConfig extends RequestConfig {
  headers: AxiosRequestHeaders;
}

let loadingInstance: { toggle(show?: boolean): void } | null = null;
let loadingCount = 0;

/**
 * request是基于axios创建的实例，实例只有常见的数据请求方法，没有axios.isCancel/ axios.CancelToken等方法，
 * 也就是没有**取消请求**和**批量请求**的方法。
 * 所以如果需要在实例中调用取消某个请求的方法（例如取消上传），请用intactRequest。
 */
const intactRequest: AxiosStatic = setConfig(axios);
const request: RequestInstance = intactRequest.create() as RequestInstance;

// 请求中的api
const pendingPool: Map<string, { method?: string; cancelFn: Canceler; global?: boolean }> = new Map();

const getLoadingInstance = (showLoading: boolean | { opt?: Partial<LoadingPropsT>; wrap: Ref<HTMLElement> | HTMLElement | string }) => {
  if (isBoolean(showLoading)) {
    return useLoading();
  } else {
    const { opt, wrap = 'body' } = showLoading;
    if (opt) {
      return useLoading(opt, wrap);
    } else {
      return useLoading();
    }
  }
};

/**
 * 请求拦截
 */
const requestInterceptorId = request.interceptors.request.use(
  (config: InternalRequestConfig) => {
    const { showLoading } = config;

    if (loadingCount === 0 && config.showLoading) {
      if (showLoading) {
        loadingInstance = getLoadingInstance(showLoading);

        loadingInstance.toggle(true);
        loadingCount++;
      }
    }
    // 存储请求信息
    // 定义取消请求
    if (!config.ignoreDuplicates) {
      config.cancelToken = new axios.CancelToken((cancelFn) => {
        if (!config?.url) {
          return;
        }

        // 如果已请求，则取消重复请求
        if (!pendingPool.has(config.url)) {
          // 存储到请求池
          pendingPool.set(config.url, {
            method: config.method,
            cancelFn,
            global: config.global,
          });
        }
      });
    }
    if (config.params) {
      Object.keys(config?.params).forEach((key) => {
        if (config.params[key] === '' || isNull(config.params[key]) || isUndefined(config.params[key])) {
          delete config.params[key];
        }
      });
    }
    return config;
  },
  (err: AxiosError) => {
    Promise.reject(err);
  }
);

/**
 * 响应拦截
 */
const responseInterceptorId = request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (loadingInstance) {
      loadingCount--;
    }
    if (loadingCount === 0 && loadingInstance) {
      loadingInstance.toggle(false);
      loadingInstance = null;
    }
    const { config } = response;

    // 请求完成，移除请求池
    if (config.url) {
      pendingPool.delete(config.url);
    }

    return Promise.resolve(handleResponse(response));
  },
  (err: AxiosError) => {
    if (loadingInstance) {
      loadingInstance.toggle(false);
      loadingCount = 0;
    }

    const config = err.config as InternalRequestConfig;

    // 非取消请求发生异常，同样将请求移除请求池
    if (!axios.isCancel(err) && config?.url) {
      pendingPool.delete(config.url);
    }

    if (err.response) {
      if (err.stack && err.stack.includes('timeout')) {
        err.message = '请求超时!';
      }
      err = handleError(err);
    }
    // 没有response(没有状态码)的情况
    else {
      // 被取消的请求
      if (axios.isCancel(err)) {
        throw new axios.Cancel(err.message || `请求'${config?.url}'被取消`);
      }
    }

    if (config && config.showError !== false && config.ignoreError !== err.response?.status) {
      const msg = useMessage();
      msg.show({
        content: err.message,
        status: 'danger',
      });
    }

    return Promise.reject(err);
  }
);
// 移除全局的请求拦截器
function removeRequestInterceptor() {
  request.interceptors.request.eject(requestInterceptorId);
}

// 移除全局的响应拦截器
function removeResponseInterceptor() {
  request.interceptors.response.eject(responseInterceptorId);
}

/**
 * 清除所有pending状态的请求
 * @param {Array} whiteList 白名单，里面的请求不会被取消
 * 返回值 被取消了的api请求
 * 可以在路由变化时取消当前所有非全局的pending状态的请求
 */
function clearPendingPool(whiteList: Array<string> = []) {
  if (!pendingPool.size) {
    return null;
  }

  const pendingUrlList: Array<string> = Array.from(pendingPool.keys()).filter((url: string) => !whiteList.includes(url));
  if (!pendingUrlList.length) {
    return null;
  }

  pendingUrlList.forEach((pendingUrl) => {
    // 清除掉所有非全局的pending状态下的请求
    if (!pendingPool.get(pendingUrl)?.global) {
      pendingPool.get(pendingUrl)?.cancelFn();
      pendingPool.delete(pendingUrl);
    }
  });

  return pendingUrlList;
}

request.removeRequestInterceptor = removeRequestInterceptor;
request.removeResponseInterceptor = removeResponseInterceptor;
request.clearPendingPool = clearPendingPool;

export { intactRequest, request };
export type { AxiosResponse, RequestConfig, RequestInstance };
