<script setup lang="ts">
import ContentWrapper from '@/components/ContentWrapper.vue';
import { OButton, OResult } from '@opensig/opendesign';

import { useTheme } from '@/composables/useTheme';
import notFoundImage from '@/assets/404.png';
import notFoundImageDark from '@/assets/404-dark.png';

import { useLocale } from '@/composables/useLocale';
const { locale } = useLocale();
const { isDark } = useTheme();
</script>

<template>
  <ContentWrapper class="result-404">
    <OResult>
      <template #image>
        <slot name="image">
          <img class="not-found-image" alt="notFound" :src="isDark ? notFoundImageDark : notFoundImage" />
        </slot>
      </template>
      <template #extra>
        <p class="text404">暂无数据</p>
        <RouterLink :to="`/${locale}/`">
          <OButton variant="solid" color="primary">返回首页</OButton>
        </RouterLink>
      </template>
    </OResult>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.result-404 {
  width: 100%;
  height: var(--layout-content-min-height);
  display: flex;
  justify-content: center;
  align-items: center;
  .text404 {
    @include text2;
    color: var(--o-color-info1);
    margin-bottom: 24px;
  }
}
</style>
