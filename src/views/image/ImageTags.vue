<script lang="ts" setup>
import { type PropType } from 'vue';
import { OTable } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { oaReport } from '@/shared/analytics';

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

const props = defineProps({
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

const route = useRoute();

const columnTags = [
  { label: 'Tag', key: 'appVer' },
  { label: 'Architectures', key: 'arch' },
  { label: '获取镜像', key: 'dockerStr' },
];

// ---------------------下载埋点--------------------
// 应用镜像埋点
const onCodeSuccess = (version: string) => {
  const { href } = window.location;
  const downloadTime = new Date();
  oaReport('download', {
    origin: href,
    softwareName: props.options.name,
    version,
    pkgId: route.query.pkgId as string,
    type: 'IMAGE',
    downloadTime,
  });
};
</script>

<template>
  <OTable :columns="columnTags" :data="data" :loading="loading" border="all">
    <template #td_dockerStr="{ row }">
      <div class="docker"><OCodeCopy :code="row.dockerStr" @success="onCodeSuccess(row.appVer)" /></div>
    </template>
  </OTable>
</template>

<style lang="scss" scoped></style>
