<script lang="ts" setup>
import ContentWrapper from '@/components/ContentWrapper.vue';

import UpstreamContent from './UpstreamContent.vue';
import bannerImg from '@/assets/banner/banner1.jpg';

const bannerInfo = {
  title: '上游兼容应用全景',
  desc: 'openEuler支持的软件包版本与上游软件的兼容状态列表',
};
</script>

<template>
  <AppBanner :title="bannerInfo.title" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
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
  margin: 32px 0;
}
</style>
