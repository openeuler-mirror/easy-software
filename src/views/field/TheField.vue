<script setup lang="ts">
import AppBanner from '@/components/AppBanner.vue';
import ContentWrapper from '@/components/ContentWrapper.vue';
import AppPkgContent from './FieldContent.vue';
import { homeData } from '@/data/home/index';

import bannerImg from '@/assets/banner/banner1.jpg';

const bannerInfo = homeData[0];
</script>
<template>
  <AppBanner :title="bannerInfo.name" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
  <ContentWrapper :vertical-padding="['40px', '72px']" class="pkg-content-wrap">
    <AppPkgContent />
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
