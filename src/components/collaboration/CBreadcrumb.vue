<script lang="ts" setup>
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';

defineProps({
  type: {
    type: String,
    default: () => '',
  },
  repo: {
    type: String,
    default: () => '',
  },
});

const { locale } = useLocale();
const { t } = useI18n();
</script>

<template>
  <OBreadcrumb class="app-breadcrumb">
    <OBreadcrumbItem :to="`/${locale}/todo/application`">待办中心</OBreadcrumbItem>
    <OBreadcrumbItem :to="`/${locale}/todo/${type}`">{{ t(`collaboration.${type}`) }}</OBreadcrumbItem>
    <OBreadcrumbItem>{{ repo }} </OBreadcrumbItem>
  </OBreadcrumb>
</template>

<style lang="scss" scoped></style>
