<script lang="ts" setup>
import { OSkeleton, OSkeletonText, OSkeletonFigure } from '@opensig/opendesign';
</script>

<template>
  <OSkeleton v-for="idx in 3" :key="idx" :animation="true" loading style="margin-bottom: 40px">
    <template #template>
      <OSkeletonText class="skeleton-name" :rows="1" />
      <div class="skeleton-figure">
        <OSkeletonFigure class="skeleton-fullname" :rows="1" />
        <OSkeletonFigure class="skeleton-fullname" :rows="1" />
        <OSkeletonFigure class="skeleton-fullname" :rows="1" />
        <OSkeletonFigure class="skeleton-fullname" :rows="1" />
      </div>
    </template>
  </OSkeleton>
</template>

<style lang="scss" scoped>
.skeleton-figure {
  display: flex;
  gap: 32px;
  margin-top: 24px;

  :deep(.o-skeleton-item) {
    margin: 0;
    flex: 1;
  }
}
</style>
