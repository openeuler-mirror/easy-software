<script setup lang="ts">
import { OButton } from '@opensig/opendesign';

import { useLocale } from '@/composables/useLocale';
import Result404 from '@/components/Result404.vue';

const { locale } = useLocale();
</script>

<template>
  <Result404>
    <template #extra>
      <p class="text404">暂无数据</p>
      <RouterLink :to="`/${locale}/`">
        <OButton variant="solid" color="primary">返回首页</OButton>
      </RouterLink>
    </template>
  </Result404>
</template>

<style lang="scss" scoped>
.text404 {
  @include text2;
  color: var(--o-color-info1);
  margin-bottom: 24px;
}
</style>
