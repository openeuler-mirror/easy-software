<script setup lang="ts">
import { ref } from 'vue';
import AppBanner from '@/components/AppBanner.vue';
import RpmContent from './RpmContent.vue';
import bannerImg from '@/assets/banner/banner1.jpg';
import NavTab from '@/components/NavTab.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const selected = ref('rpm');
</script>
<template>
  <AppBanner :title="t('software.softwareList')" :background-image="bannerImg">
    <template #tabs>
      <NavTab v-model="selected" />
    </template>
  </AppBanner>
  <ContentWrapper :vertical-padding="['32px', '72px']" class="pkg-content-wrap">
    <RpmContent />
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
