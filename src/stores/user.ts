import type { Identity } from '@/@types/type-user';
import { LOGIN_STATUS, type LoginStatusT } from '@/shared/login';
import { defineStore } from 'pinia';

/**
 * 用户基本信息
 */
export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      identities: [] as Identity[],
      photo: '' as string,
      username: '' as string,
      upstreamPermission: null as boolean | null,
      // 协作平台admin权限
      platformAdminPermission: null as boolean | null,
      // 协作平台maintainer权限
      platformMaintainerPermission: null as boolean | null,
    }
  },
  getters: {
    // 判断是否有绑定gitee
    isGiteeAccount(): boolean {
      return !!this.identities.find((id) => id.identity === 'gitee');
    },
  },
});

/**
 * 登录状态
 */
export const useLoginStore = defineStore('login', {
  state: () => {
    return {
      loginStatus: LOGIN_STATUS.NOT,
    };
  },
  actions: {
    setLoginStatus(status: LoginStatusT) {
      this.loginStatus = status;
    },
  },
  getters: {
    // 登录失败
    isLoginFailed(): boolean {
      return this.loginStatus === LOGIN_STATUS.FAILED;
    },
    // 未登录
    isLoginNot(): boolean {
      return this.loginStatus === LOGIN_STATUS.NOT;
    },
    // 登录中
    isLoggingIn(): boolean {
      return this.loginStatus === LOGIN_STATUS.DOING;
    },
    // 登录成功
    isLogined(): boolean {
      return this.loginStatus === LOGIN_STATUS.DONE;
    },
  },
});