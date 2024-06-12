<script lang="ts" setup>
import { OSkeleton, OSkeletonText } from '@opensig/opendesign';
</script>

<template>
  <OSkeleton class="skeleton-fullname">
    <template #template>
      <OSkeletonText class="title" :rows="1" />
      <OSkeletonText :style="{ width: '88%', margin: '16px 0 0 28px' }" :rows="5" />
    </template>
  </OSkeleton>
</template>

<style lang="scss" scoped>
.skeleton-fullname {
  margin: 0 0 40px;
  .o-skeleton-text {
    --skeleton-height: 18px;
  }
  .title {
    width: 75%;
    margin: 0 0 12px;

    --skeleton-height: 24px;
  }
}
</style>
