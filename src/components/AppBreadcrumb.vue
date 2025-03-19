<script lang="ts" setup>
import { computed } from 'vue';
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { homeData } from '@/data/home/index';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
});

const { locale } = useLocale();
const { t } = useI18n();
const breadcrumbInfo = computed(() => {
  return homeData.find((item) => item.id === props.id);
});
</script>

<template>
  <OBreadcrumb class="app-breadcrumb">
    <OBreadcrumbItem :to="`/${locale}/`">{{ t('software.softwareHome') }}</OBreadcrumbItem>
    <OBreadcrumbItem :to="`/${locale}${breadcrumbInfo.href}`">{{ breadcrumbInfo.name }}</OBreadcrumbItem>
    <OBreadcrumbItem>{{ name }} </OBreadcrumbItem>
  </OBreadcrumb>
</template>

<style lang="scss" scoped></style>
