<script lang="ts" setup>
import { type PropType } from 'vue';
import { OTable } from '@opensig/opendesign';

interface OptionsT {
  name: string;
  os: string;
  arch: string;
}

interface EulerverT {
  arch: string;
  appVer: string;
  dockerStr: string;
}

defineProps({
  data: {
    type: Array as PropType<EulerverT[]>,
    default: () => [],
  },
  options: {
    type: Object as PropType<OptionsT>,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits<{
  (event: 'copy', val: Record<string, any>): void;
}>();

const columnTags = [
  { label: 'Tag', key: 'appVer' },
  { label: 'Architectures', key: 'arch' },
  { label: '获取镜像', key: 'dockerStr' },
];

// ---------------------下载埋点--------------------
// 应用镜像埋点
const onCodeSuccess = (row: any) => {
  emit('copy', {
    architectures: row.arch,
    tag: row.appVer,
  });
};
</script>

<template>
  <OTable :columns="columnTags" :data="data" :loading="loading" border="all">
    <template #td_dockerStr="{ row }">
      <div class="docker"><OCodeCopy :code="row.dockerStr" @success="onCodeSuccess(row)" /></div>
    </template>
  </OTable>
</template>

<style lang="scss" scoped></style>
