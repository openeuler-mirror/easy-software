<script lang="ts" setup>
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { resourceData } from '@/data/home/index';

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

const breadcrumbInfo = () => {
  resourceData.forEach((item) => {
    if (item.id === props.id) {
      return item;
    }
  });
};
breadcrumbInfo()
</script>

<template>
  <OBreadcrumb>
    <OBreadcrumbItem :to="/${locale.value}/">软件市场</OBreadcrumbItem>
    <OBreadcrumbItem :to="`/${locale.value}/${breadcrumbInfo.href}`">{{ breadcrumbInfo.name }}</OBreadcrumbItem>
    <OBreadcrumbItem>{{ name }} </OBreadcrumbItem>
  </OBreadcrumb>
</template>

<style lang="scss" scoped></style>
