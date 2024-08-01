<script lang="ts" setup>
import { OSkeleton, OSkeletonText } from '@opensig/opendesign';
</script>

<template>
  <OSkeleton v-for="idx in 3" :key="idx" loading style="margin-bottom: 40px">
    <template #template>
      <div class="skeleton-flex">
        <OSkeletonText style="width: 120px" :rows="1" />
        <OSkeletonText style="width: 120px" :rows="1" />
      </div>
      <section class="skeleton-figure">
        <OCardItemSkeleton v-for="tag in 4" :key="tag" />
      </section>
    </template>
  </OSkeleton>
</template>

<style lang="scss" scoped>
.skeleton-flex {
  display: flex;
  justify-content: space-between;
}
.skeleton-figure {
  display: flex;
  margin-top: 24px;
}
.o-skeleton-item + .o-skeleton-item {
  margin: 0;
}
</style>
