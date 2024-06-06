<script lang="ts" setup>
import { OSkeleton, OSkeletonText, OSkeletonFigure } from '@opensig/opendesign';
</script>

<template>
  <OSkeleton animation class="skeleton-fullname">
    <template #template>
      <div class="domain-head">
        <div class="left">
          <OSkeletonFigure class="cover" />
          <div style="flex: 1">
            <OSkeletonText class="name" :rows="1" />
            <OSkeletonText :rows="3" />
          </div>
        </div>
        <div class="right">
          <OSkeletonText class="name" :rows="1" />
          <OSkeletonText class="desc" :rows="3" />
        </div>
      </div>
      <div class="domain-main">
        <div class="left">
          <div style="margin-bottom: 40px">
            <OSkeletonText class="name" :rows="1" />
            <OSkeletonText :rows="5" />
          </div>
          <div style="margin-bottom: 40px">
            <OSkeletonText class="name" :rows="1" />
            <OSkeletonText :rows="5" />
          </div>
        </div>
        <div class="right">
          <div style="margin-bottom: 40px">
            <OSkeletonText class="name" :rows="1" />
            <OSkeletonText :rows="5" />
          </div>
          <div style="margin-bottom: 40px">
            <OSkeletonText class="name" :rows="1" />
            <OSkeletonText :rows="5" />
          </div>
        </div>
      </div>
    </template>
  </OSkeleton>
</template>

<style lang="scss" scoped>
.o-skeleton-item + .o-skeleton-item {
  margin: 0;
}
.name {
  --skeleton-height: 24px;
  margin-bottom: 24px;
  width: 36%;
}
.domain-head {
  padding: 40px;
  background: var(--o-color-fill2);
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  margin-bottom: 40px;

  .left {
    display: flex;
    justify-content: space-between;
    width: 936px;
  }
  .right {
    margin-left: 32px;
    flex: 1;
  }
  .cover {
    width: 300px;
    height: 174px;
    margin-right: 32px;
  }
}

.domain-main {
  display: flex;
  justify-content: space-between;
  min-height: calc(100vh - var(--layout-footer-height) - var(--layout-header-height));

  --skeleton-height: 24px;
  .left {
    width: 936px;
    background: var(--o-color-fill2);
    padding: 32px 40px;
  }
  .right {
    margin-left: 32px;
    flex: 1;
    background: var(--o-color-fill2);
    padding: 32px 40px;
  }
}
</style>
