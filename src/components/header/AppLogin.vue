<script setup lang="ts">
import { doLogin, logout } from '@/shared/login';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { ODropdown, ODropdownItem, OIcon, OIconLoading } from '@opensig/opendesign';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import LoginIcon from '~icons/app/icon-login.svg';

const { username, photo } = storeToRefs(useUserInfoStore());
const userInfoArea = ref();
const loginStore = useLoginStore();

const login = () => doLogin();
</script>

<template>
  <template v-if="loginStore.isLogined">
    <ODropdown trigger="hover" optionPosition="bottom" optionWrapClass="user-dropdown">
      <div class="user-info" ref="userInfoArea">
        <img v-if="photo" :src="photo" />
        {{ username }}
      </div>
      <template #dropdown>
        <ODropdownItem>
          <div class="header-user-menu-item" @click="logout">退出登录</div>
        </ODropdownItem>
      </template>
    </ODropdown>
  </template>
  <div v-else-if="loginStore.isLoggingIn" class="o-rotating">
    <OIconLoading />
  </div>

  <OIcon v-else class="login-btn" @click="login"><LoginIcon /></OIcon>
</template>

<style scoped lang="scss">
.user-info {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  position: relative;
  height: 64px;

  img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
}

.header-user-menu-item {
  padding: 0 16px;
}

.login-btn {
  color: var(--o-color-info1);
  cursor: pointer;
}
</style>
