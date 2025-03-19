<script setup lang="ts">
import { OButton } from '@opensig/opendesign';

import { useLocale } from '@/composables/useLocale';
import Error404Result from '@/components/Error404Result.vue';

const { locale } = useLocale();
</script>

<template>
  <Error404Result>
    <template #extra>
      <p class="text404">暂无数据</p>
      <RouterLink :to="`/${locale}/`">
        <OButton variant="solid" color="primary">返回首页</OButton>
      </RouterLink>
    </template>
  </Error404Result>
</template>

<style lang="scss" scoped>
.text404 {
  @include text2;
  color: var(--o-color-info1);
  margin-bottom: 24px;
}
</style>
