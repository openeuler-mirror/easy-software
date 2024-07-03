<template>
  <div class="drop">
    <OSelect v-model="tag" variant="outline" @change="jumpTo" :placeholder="tagVer[0]">
      <OOption v-for="item in getTarget(verData, 'os')" :key="item.pkgId" :value="item.pkgId" :label="item.os"
    /></OSelect>
    <OSelect v-model="tagT" variant="outline" @change="jumpTo" :placeholder="tagVer[1]">
      <OOption v-for="item in getTarget(verData, 'arch')" :key="item.pkgId" :value="item.pkgId" :label="item.arch"
    /></OSelect>
  </div>
</template>
<script setup lang="ts">
import { getTarget } from '@/utils/common';
import { OSelect, OOption } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { ref } from 'vue';
const props = defineProps({
  verData: {
    type: Object,
    default: () => {
      return [];
    },
  },
  tagVer: {
    type: Object,
    default: () => {
      return [];
    },
  },
  type: {
    type: String,
    default: () => {
      return 'RPM';
    },
  },
});
const { locale } = useLocale();
const tag = ref();
const tagT = ref();
const jumpTo = (id: any) => {
  if (props.type) {
    const detailType = props.type === 'IMAGE' ? 'image' : props.type === 'RPM' ? 'rpm' : 'epkg';
    const newHref = `/${locale.value}/${detailType}/detail?pkgId=${encodeURIComponent(id)}`;
    window.location.href = newHref;
  }
};
</script>
<style scoped lang="scss">
@import '@/assets/style/category/detail/index.scss';
</style>
