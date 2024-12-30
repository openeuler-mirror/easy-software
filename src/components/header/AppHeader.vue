<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ODivider, OLink } from '@opensig/opendesign';
import { useRouter, useRoute } from 'vue-router';
import { useLangStore } from '@/stores/common';
import { OPENEULER } from '@/data/config';
import { useI18n } from 'vue-i18n';
import { navs, collaborationNav } from '@/data/nav';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { COLLABORATIONPERMISSION } from '@/data/query';
import { windowOpen } from '@/utils/common';

import { useTheme } from '@/composables/useTheme';
import HeaderNav from '@/components/header/HeaderNav.vue';
import AppLogin from '@/components/header/AppLogin.vue';
import HeaderTheme from '@/components/header/HeaderTheme.vue';

import openeulerLogo from '@/assets/openeuler-logo.svg';
import openeulerLogoDark from '@/assets/openeuler-logo-dark.svg';

const { locale, t } = useI18n();
const router = useRouter();
const route = useRoute();
const langStore = useLangStore();
const { isDark } = useTheme();
const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

watch(
  () => {
    return locale.value as string;
  },
  (val: string) => {
    langStore.setLangStore(val);
  }
);

const goHome = () => {
  router.push({
    path: `/${locale.value}`,
  });
};

// 判断是否是协作平台
const isCollaboration = computed(() => {
  return COLLABORATIONPERMISSION.includes(route.name as string);
});

// 是否是待办中心
const isTodo = computed(() => {
  return ['todo', 'todo-detail'].includes(route.name as string);
});

const jump = (href: string) => {
  nextTick(() => {
    if (isAdminPer.value || isMainPer.value) {
      if (href === 'collaboration') {
        windowOpen(`/${locale.value}/${href}`, '_blank');
      } else {
        router.push({
          path: `/${locale.value}/${href}${isMainPer.value ? '/application' : '/approval'}`,
        });
      }
    } else {
      router.push({
        path: `/${locale.value}/collaboration-permission`,
      });
    }
  });
};

const isPageHome = ref(false);

// -------------------- 出现横向滚动条时，头部导航自适应 --------------------
const headerLeft = ref(0);

const onScroll = () => {
  headerLeft.value = window.scrollX;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll);

  isPageHome.value = route.name === 'home';
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(
  () => route.name,
  () => {
    isPageHome.value = route.name === 'home';
  },
  { deep: true }
);
</script>

<template>
  <div class="app-header">
    <div class="app-header-wrap" :style="{ right: `${headerLeft}px` }">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <a target="_blank" :href="`${OPENEULER}/${locale}`" class="community-logo" rel="noopener noreferrer">
              <img :src="isDark ? openeulerLogoDark : openeulerLogo" />
            </a>
            <ODivider direction="v" :darker="true" />
            <span @click="goHome" class="logo-text">{{ t('software.softwareHome') }}</span>
            <span v-if="isCollaboration" class="collaboration-text">协作平台</span>
          </div>
          <HeaderNav v-if="route.name" :options="isCollaboration ? collaborationNav : navs" />
        </div>
        <div class="header-right">
          <div class="header-search">
            <SearchFilter :show="false" :is-header="true" v-if="isPageHome" />
          </div>
          <template v-if="loginStore.isLogined && route.name">
            <OLink v-if="isCollaboration" class="todo" @click="jump(`todo`)" :class="{ active: isTodo }">待办中心</OLink>
            <OLink v-else class="collaboration" @click="jump(`collaboration`)">协作平台</OLink>
          </template>
          <HeaderTheme />
          <AppLogin />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-show {
  :deep(.search-content) {
    border-radius: 4px;
  }
}
.header-search {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  margin-right: 20px;
  opacity: 0;
  visibility: hidden;
  transition: all var(--o-duration-m2) var(--o-easing-standard);

  :deep(.search) {
    --search-height: 30px;
    .search-content-detail {
      padding-left: 0;
      .recommend {
        width: 100%;
        box-shadow: none;
        background: none;
        padding: 16px 0 0;
      }
    }

    .o-input {
      --input-height: var(--search-height);
    }
    .o-select {
      --select-height: var(--search-height);
      --select-padding: 0 12px;
    }
    .search-input {
      width: 160px;
    }
    .search-icon,
    .o-input-clear {
      width: 18px;
      height: 18px;
    }
  }
}

.app-header {
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
  min-width: 1440px;
  width: 100%;
  &.search-show {
    .header-search {
      opacity: 1;
      visibility: visible;
    }
  }
  .app-header-wrap {
    position: relative;
    height: 100%;
  }
  .header-content {
    display: flex;
    align-items: center;
    height: 100%;
    max-width: var(--layout-content-max-width);
    padding: 0 var(--layout-content-padding);
    justify-content: space-between;
    margin: 0 auto;
    height: 100%;
    .logo-text {
      color: var(--o-color-info1);
      font-weight: bold;
      cursor: pointer;
      @include h4;
    }
    .collaboration-text {
      color: var(--o-color-info1);
      font-weight: bold;
      margin-left: 48px;
      cursor: default;
      @include h4;
    }
    .header-left,
    .header-right {
      height: 100%;
      display: flex;
      align-items: center;

      .collaboration,
      .todo {
        margin-right: 16px;
        color: var(--o-color-info1);
        @include tip1;
        &.active {
          color: var(--o-color-primary1);
        }
      }
    }
  }
  .logo {
    display: flex;
    align-items: center;
  }
  .community-logo {
    img {
      height: 28px;
    }
  }
}

:deep(.search-box) {
  .search-input {
    width: 380px;
  }
  .recommend {
    top: 40px;
  }
}

.header-logo {
  display: flex;
  align-items: center;
  height: 100%;

  a {
    display: flex;
    align-items: center;
    .community-logo {
      height: 18px;
    }
  }
}

.header-lang {
  height: 100%;
  display: flex;
  align-items: center;
  .lang {
    @include tip1;
    color: var(--o-color-info2);
    margin-right: 4px;
  }
  .o-dropdown {
    height: 100%;
  }
  .info-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .o-dropdown-item {
    @include text1;
    width: 136px;
    white-space: nowrap;
  }
}

.opt-user {
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  .opt-info {
    display: flex;
    align-items: center;
    .opt-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      vertical-align: middle;
      @media (max-width: 1100px) {
        width: 28px;
        height: 28px;
      }
    }
    .opt-name {
      color: var(--o-color-text2);
      margin-left: 8px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 72px;
      line-height: var(--o-line-height-h8);
      @media (max-width: 1100px) {
        display: none;
      }
    }
  }
  &:hover {
    .menu-list {
      display: block;
    }
  }
  .menu-list {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    @media (max-width: 1100px) {
      top: 48px;
      left: -60px;
    }
    background: var(--o-color-bg2);
    cursor: pointer;
    z-index: 999;
    box-shadow: var(--o-shadow-l1);
    min-width: 78px;
    li {
      text-align: center;
      @include text1;
      color: var(--o-color-text1);
      border-bottom: 1px solid var(--o-color-division1);
      padding: 0 var(--o-gap-5);
      white-space: nowrap;
      &:last-child {
        border-bottom: 0 none;
      }

      &:hover {
        background: var(--o-color-brand1);
        color: var(--o-color-text2);
      }
      &.active {
        color: var(--o-color-brand1);
        background: none;
        cursor: default;
      }
    }
  }
}
.login {
  .icon {
    font-size: var(--o-font_size-h4);
    color: var(--o-color-info1);
    cursor: pointer;
  }
}
</style>
