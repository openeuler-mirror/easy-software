<script setup lang="ts">
import AppBanner from '@/components/AppBanner.vue';
import RpmContent from './RpmContent.vue';
import { homeData } from '@/data/home/index';

import bannerImg from '@/assets/banner/banner1.jpg';

const bannerInfo = homeData[1];
</script>
<template>
  <AppBanner :title="bannerInfo.name" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
  <ContentWrapper :vertical-padding="['40px', '72px']" class="pkg-content-wrap">
    <RpmContent />
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
