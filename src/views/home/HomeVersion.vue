<script lang="ts" setup>
import { OTag, OLink, OTable } from '@opensig/opendesign';
import { ref, onMounted } from 'vue';
import { getSearchAllFiled } from '@/api/api-domain';
import { formatDateTime } from '@/utils/common';

const columns = [
  { label: 'openEuler社区版本', key: 'os', style: 'width:20%' },
  { label: '发布时间', key: 'releaseTime', style: 'width:15%' },
  { label: '计划维护时长', key: 'maintenanceDuration', style: 'width:15%' },
  { label: '计划维护停止时间', key: 'plannedMaintenanceEndtime', style: 'width:15%' },
  { label: '实际维护停止时间', key: 'actualMaintenanceEndtime', style: 'width:15%' },
  { label: '状态', key: 'status', style: 'width:10%' },
];

const loading = ref(false);
const versionData = ref([]);
const queryEulerVersion = () => {
  const params = {
    name: 'eulerLifecycle',
  };
  loading.value = true;
  getSearchAllFiled(params)
    .then((res) => {
      versionData.value = res.data.list.reverse();
      loading.value = false;
    })
    .catch((err) => {});
};

const statusType = (v: string) => {
  if (v === '停止维护') {
    return 'warning';
  } else if (v === '开发中') {
    return 'primary';
  } else if (v === '正常') {
    return 'success';
  }
};

const timeFormat = (t: string) => {
  if (t.startsWith('0000-00-00')) {
    return '-';
  } else {
    return formatDateTime(t);
  }
};

onMounted(() => {
  queryEulerVersion();
});
</script>

<template>
  <OTable :columns="columns" class="table-version" :data="versionData" :loading="loading" border="all">
    <template #td_os="{ row }">
      <OLink color="primary">{{ row.os }}</OLink>
    </template>
    <template #td_releaseTime="{ row }">
      {{ timeFormat(row.releaseTime) }}
    </template>
    <template #td_plannedMaintenanceEndtime="{ row }">
      {{ timeFormat(row.plannedMaintenanceEndtime) }}
    </template>
    <template #td_actualMaintenanceEndtime="{ row }">
      {{ timeFormat(row.actualMaintenanceEndtime) }}
    </template>
    <template #td_status="{ row }">
      <OTag v-if="row.status" class="app-tag" :color="statusType(row.status)">{{ row.status }} </OTag>
    </template>
  </OTable>
</template>

<style lang="scss" scoped>
:deep(.o-tag) {
  min-width: 72px;
  &.o-tag-primary {
    --tag-bg-color: #058ef0;
    --tag-bd-color: #058ef0;
  }
}
</style>
