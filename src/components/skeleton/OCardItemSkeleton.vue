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
          <OSkeletonText v-for="tag in 4" :key="tag" :rows="1" />
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
.skeleton-fullname + .skeleton-fullname {
  margin-left: 32px;
}
.skeleton-fullname {
  flex: 1;
  padding: 24px;
  background: var(--o-color-fill2);

  .pkg-info {
    display: flex;
    align-items: center;
    height: 60px;
    .pkg-icon {
      margin-left: 24px;
    }
  }
  .pkg-icon {
    height: 32px;
    width: 64px;
  }
  .name {
    @include h3;
    flex: 1;
  }
  .pkg-box {
    .tags-box {
      display: flex;
      justify-content: space-between;
      .o-skeleton-text {
        --skeleton-height: 24px;
      }
      .o-skeleton-text + .o-skeleton-text {
        margin-left: 8px;
      }
    }
    .desc {
      height: 48px;
      margin-top: 16px;
    }
  }
}
</style>
