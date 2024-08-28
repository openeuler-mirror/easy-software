<script setup lang="ts">
import ContentWrapper from '@/components/ContentWrapper.vue';
import { OResult } from '@opensig/opendesign';

import { useTheme } from '@/composables/useTheme';
import notFoundImage from '@/assets/404.png';
import notFoundImageDark from '@/assets/404-dark.png';

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
      <slot name="extra" />
      <slot name="description" />
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
}
</style>
