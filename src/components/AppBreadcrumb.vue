<script lang="ts" setup>
import { ref } from 'vue';
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { homeData } from '@/data/home/index';
import { HomeInfoT } from '@/@types/app';
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
const breadcrumbInfo = ref({} as HomeInfoT);

homeData.forEach((item) => {
  if (item.id === props.id) {
    breadcrumbInfo.value = item;
  }
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
