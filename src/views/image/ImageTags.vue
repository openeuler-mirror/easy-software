<script lang="ts" setup>
import { type PropType } from 'vue';
import { OTable } from '@opensig/opendesign';
import { useRoute } from 'vue-router';

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
// 容器镜像埋点
const onCodeSuccess = (row: EulerverT) => {
  const sensors = (window as any)['sensorsDataAnalytic201505'];
  const { href } = window.location;
  const downloadTime = new Date();
  sensors?.setProfile({
    ...(window as any)['sensorsCustomBuriedData'],
    profileType: 'download',
    origin: href,
    pkgId: route.query.pkgId as string,
    tagId: row.appVer + row.arch,
    downloadTime,
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
