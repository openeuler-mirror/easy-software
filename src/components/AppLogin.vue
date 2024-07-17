<script setup lang="ts">
import { doLogin, getCsrfToken, logout } from '@/shared/login';
import { useUserInfoStore } from '@/stores/user';
import { OLink, OPopup } from '@opensig/opendesign';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const { userInfo } = storeToRefs(useUserInfoStore());
const userInfoArea = ref();
const csrfToken = getCsrfToken();

const login = () => doLogin();
</script>

<template>
  <template v-if="csrfToken">
    <div class="user-info" ref="userInfoArea">
      <img :src="userInfo.photo" />
      {{ userInfo.username }}
    </div>
    <OPopup position="bottom" :target="userInfoArea">
      <div class="header-user-menu">
        <div class="item" @click="logout">
          退出登录
        </div>
      </div>
    </OPopup>
  </template>
  <div v-else>
    <OLink @click="login">登录</OLink>
  </div>
</template>

<style scoped lang="scss">
.user-info {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
}

.header-user-menu {
  display: flex;
  flex-direction: column;
  background-color: var(--o-color-white);
  box-shadow: var(--o-shadow-3);

  .item {
    cursor: pointer;
    padding: 8px 24px;
    font-size: var(--o-font_size-text1);
    border-bottom: 1px solid var(--o-color-control1-light);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>