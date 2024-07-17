<script setup lang="ts">
import ImageContent from './ImageContent.vue';
import AppBanner from '@/components/AppBanner.vue';
import { homeData } from '@/data/home/index';

import bannerImg from '@/assets/banner/banner1.jpg';

const bannerInfo = homeData[2];
</script>
<template>
  <AppBanner :title="bannerInfo.name" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
  <ContentWrapper vertical-padding="40px" class="pkg-content-wrap">
    <ImageContent />
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
