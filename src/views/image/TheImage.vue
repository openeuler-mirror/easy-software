<script setup lang="ts">
import ImageContent from './ImageContent.vue';
import AppBanner from '@/components/AppBanner.vue';
import { homeData } from '@/data/home/index';

import bannerImg from '@/assets/banner/banner.jpg';

const bannerInfo = homeData[2];
</script>
<template>
  <AppBanner :title="bannerInfo.name" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
  <ContentWrapper vertical-padding="40px">
    <ImageContent />
  </ContentWrapper>
</template>

<style scoped lang="scss"></style>
