<script setup lang="ts">
import AppBanner from '@/components/AppBanner.vue';
import EpkgContent from './EpkgContent.vue';
import { homeData } from '@/data/home/index';
import bannerImg from '@/assets/banner/banner.jpg';

const bannerInfo = homeData[3];
</script>
<template>
  <AppBanner :title="bannerInfo.name" :background-image="bannerImg" :subtitle="bannerInfo.desc" />
  <ContentWrapper vertical-padding="40px">
    <EpkgContent />
  </ContentWrapper>
</template>

<style scoped lang="scss"></style>
