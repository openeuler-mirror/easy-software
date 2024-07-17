<script lang="ts" setup>
import ContentWrapper from '@/components/ContentWrapper.vue';

import UpstreamContent from './UpstreamContent.vue';
import bannerImg from '@/assets/banner/banner1.jpg';
</script>

<template>
  <AppBanner title="上游兼容应用全景" :background-image="bannerImg" subtitle="上游兼容应用全景简介" />
  <ContentWrapper vertical-padding="40px" class="pkg-content-wrap">
    <UpstreamContent />
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';
:deep(.o-table) {
  .label {
    display: flex;
    align-items: center;
    .icon-filter {
      cursor: pointer;
      svg {
        fill: currentColor;
        color: var(--o-color-info3);
        width: 20px;
        margin-left: 3px;
      }
    }
  }
}

.pagination-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 40px 0;
}
</style>
