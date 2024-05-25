<script lang="ts" setup>
import { ref } from 'vue';
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { homeData } from '@/data/home/index';
import { HomeInfoT } from '@/@types/app';

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
const breadcrumbInfo = ref({} as HomeInfoT);

homeData.forEach((item) => {
  if (item.id === props.id) {
    breadcrumbInfo.value = item;
  }
});
</script>

<template>
  <OBreadcrumb class="app-breadcrumb">
    <OBreadcrumbItem :to="/${locale.value}/">软件市场</OBreadcrumbItem>
    <OBreadcrumbItem :to="`/${locale.value}/${breadcrumbInfo.href}`">{{ breadcrumbInfo.name }}</OBreadcrumbItem>
    <OBreadcrumbItem>{{ name }} </OBreadcrumbItem>
  </OBreadcrumb>
</template>

<style lang="scss" scoped></style>
