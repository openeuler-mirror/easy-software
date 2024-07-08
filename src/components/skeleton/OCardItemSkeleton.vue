<script lang="ts" setup>
import { OSkeleton, OSkeletonText, OSkeletonFigure } from '@opensig/opendesign';
</script>

<template>
  <OSkeleton class="skeleton-fullname">
    <template #template>
      <div class="pkg-info">
        <OSkeletonText class="name" :rows="2" />
        <OSkeletonFigure class="pkg-icon" />
      </div>
      <div class="pkg-box">
        <div class="tags-box">
          <OSkeletonText v-for="tag in 3" :key="tag" :rows="1" />
        </div>
        <OSkeletonText class="desc" :rows="2" />
      </div>
    </template>
  </OSkeleton>
</template>

<style lang="scss" scoped>
.o-skeleton-item + .o-skeleton-item {
  margin: 0;
}
.skeleton-fullname {
  height: 182px;
  flex: 1;
  padding: 24px;
  background: var(--o-color-fill2);
  .pkg-info {
    display: flex;
    align-items: center;
    gap: 24px;
    height: 60px;
  }
  .pkg-icon {
    height: 32px;
    width: 64px;
    margin: 0 !important;
  }
  .name {
    @include h3;
    flex: 1;
  }
  .pkg-box {
    height: 102px;
    .tags-box {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      .o-skeleton-text {
        --skeleton-height: 24px;
      }
    }
    .desc {
      height: 48px;
      margin-top: 16px;
    }
  }
}
</style>
