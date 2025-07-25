<script setup lang="ts">
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterView } from 'vue-router';
import { OScroller, OConfigProvider } from '@opensig/opendesign';
import zhCN from '@opensig/opendesign/es/locale/lang/zh-cn';
import enUS from '@opensig/opendesign/es/locale/lang/en-us';

import { useLangStore, useViewStore } from '@/stores/common';
import { useLocale } from '@/composables/useLocale';

import AppHeader from '@/components/header/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import GlobalFeedback from './components/GlobalFeedback.vue';
import CookieNotice from './components/CookieNotice.vue';

const langStore = useLangStore();
const viewState = useViewStore();
const { locale } = useI18n();
watch(
  () => langStore.lang,
  (val) => {
    locale.value = val;
  }
);

// -------------------- 组件国际化 --------------------
const { isZh } = useLocale();
</script>

<template>
  <OConfigProvider :locale="isZh ? zhCN : enUS">
    <AppHeader />
    <OScroller show-type="hover">
      <main class="ly-main">
        <GlobalFeedback />
        <RouterView v-if="!viewState.notFoundPage" />
        <ResultNotFound v-else />
      </main>
      <AppFooter />
    </OScroller>
    <CookieNotice />
  </OConfigProvider>
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--o-color-fill1);
  min-width: 1440px;

  --layout-header-height: 64px;
  --layout-header-zIndex: 20;
  --layout-header-max-width: 1440px;
  --layout-header-padding: 64px;

  --layout-content-max-width: 1440px;
  --layout-content-padding: 12px;

  --layout-footer-height: 242px;

  --layout-content-banner: 160px;

  --layout-screen-height: 100vh;

  --layout-content-min-height: calc(var(--layout-screen-height) - var(--layout-header-height) - var(--layout-footer-height));

  @include respond-to('<=laptop') {
    --layout-header-max-width: 100%;
    --layout-header-padding: 5%;

    --layout-content-padding: 5%;
  }
}
</style>
<style scoped lang="scss">
.o-scroller {
  height: var(--layout-screen-height);
  background-color: var(--o-color-fill1);
  --scrollbar-height: calc(var(--layout-screen-height) - var(--layout-header-height) * 2 - 10px);
  :deep(.o-scroller-container) {
    scroll-padding-top: var(--layout-header-height);
  }
}
.ly-main {
  position: relative;
  min-height: calc(var(--layout-content-min-height) + var(--layout-header-height));
  background-color: var(--o-color-fill1);
  padding-top: var(--layout-header-height);
}
</style>
