<script setup lang="ts">
import { doLogin, getCsrfToken, logout } from '@/shared/login';
import { useUserInfoStore } from '@/stores/user';
import { ODropdown, ODropdownItem, OIcon, OPopup } from '@opensig/opendesign';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import LoginIcon from '~icons/app/icon-login.svg';

const { username, photo } = storeToRefs(useUserInfoStore());
const userInfoArea = ref();
const csrfToken = getCsrfToken();

const login = () => doLogin();
</script>

<template>
  <template v-if="csrfToken">
    <ODropdown trigger="hover" optionPosition="bottom" optionWrapClass="user-dropdown">
      <div class="user-info" ref="userInfoArea">
        <img :src="photo" />
        {{ username }}
      </div>
      <template #dropdown>
        <ODropdownItem>
          <div class="header-user-menu-item" @click="logout">
            退出登录
          </div>
        </ODropdownItem>
      </template>
    </ODropdown>
  </template>
  <div v-else class="login-btn" @click="login">
    <OIcon><LoginIcon /></OIcon>
  </div>
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

.header-user-menu {
  display: flex;
  flex-direction: column;
  background-color: var(--o-color-white);
  box-shadow: var(--o-shadow-3);

  li {
    cursor: pointer;
    padding: 16px;
    font-size: var(--o-font_size-tip1);
    border-bottom: 1px solid var(--o-color-control1-light);
    white-space: nowrap;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: rgb(var(--o-kleinblue-6));
      color: var(--o-color-white);
    }
  }
}

.login-btn {
  cursor: pointer;
}
</style>