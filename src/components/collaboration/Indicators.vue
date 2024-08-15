<script lang="ts" setup>
import { ref } from 'vue';
import { OTable, OTag, ODialog } from '@opensig/opendesign';

const columns = [
  { label: 'CVE分类', key: 'cve', type: 'cve' },
  { label: 'CVE详细分类', key: 'cveType', type: 'cve_type' },
  { label: '贡献分类', key: 'contribution', type: 'contribution' },
  { label: '详细描述', key: 'details', type: 'details' },
  { label: '维护状态', key: 'maintenance', type: 'maintenance' },
  { label: '描述', key: 'description', type: 'description' },
];

const data = [
  {
    cve: '有CVE',
    cveType: 'CVE全部未修复',
    contribution: '没有ISSUE修复',
    details: '-',
    maintenance: 5,
    description: 'CVE全部未修复，且没有ISSUE修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部未修复',
    contribution: '有部分ISSUE修复',
    details: '-',
    maintenance: 4,
    description: 'CVE全部未修复，且有部分ISSUE被修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部未修复',
    contribution: '全部ISSUE修复',
    details: '-',
    maintenance: 4,
    description: 'CVE全部未修复，全部ISSUE都被修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE部分修复',
    contribution: '-',
    details: '-',
    maintenance: 4,
    description: 'CVE部分修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部修复',
    contribution: '-',
    details: '-',
    maintenance: 1,
    description: 'CVE全部修复',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '没有PR提交',
    details: '最新版本',
    maintenance: 1,
    description: '没有CVE问题，且也没有PR提交，且软件包是最新版本',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '没有PR提交',
    details: '落后版本',
    maintenance: 3,
    description: '没有CVE问题，且也没有PR提交，且软件包是落后版本',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '有PR合入',
    details: '-',
    maintenance: 2,
    description: '没有CVE问题，有PR合入',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '有PR提交未合入',
    details: '-',
    maintenance: 2,
    description: '没有CVE问题，有PR提交但是没有PR被合入',
  },
];

// 单元格合并
const cellSpanFn = (rowIdx: number, colIdx: number) => {
  if (rowIdx === 0 && colIdx === 0) {
    return {
      rowspan: 5,
    };
  }
  if (rowIdx === 0 && colIdx === 1) {
    return {
      rowspan: 3,
    };
  }
  if (rowIdx === 5 && colIdx === 0) {
    return {
      rowspan: 4,
    };
  }
  if (rowIdx === 5 && colIdx === 1) {
    return {
      rowspan: 4,
    };
  }
  if (rowIdx === 5 && colIdx === 2) {
    return {
      rowspan: 2,
    };
  }
};

const mainStatus = {
  1: '健康',
  2: '活跃',
  3: '静止',
  4: '缺人维护',
  5: '没有人维护',
};

const showDlg = ref(true);

const emits = defineEmits<{
  (e: 'change'): void;
}>();

const onChange = () => {
  emits('change');
};
</script>

<template>
  <ODialog
    v-model:visible="showDlg"
    :unmount-on-hide="true"
    :mask="true"
    size="large"
    :style="{
      '--dlg-width': '1170px',
    }"
    @change="onChange"
  >
    <template #header>
      <p class="title">状态指标说明</p>
    </template>
    <div class="indicators">
      <p class="title">软件包维护状态指标</p>
      <OTable class="main-table" :columns="columns" :data="data" :cell-span="cellSpanFn" border="all">
        <template #td_maintenance="{ row }">
          <OTag :class="`type${row.maintenance}`" size="small">{{ mainStatus[row.maintenance] }} </OTag>
        </template>
      </OTable>
      <p class="title">详细指标</p>
    </div>
  </ODialog>
</template>

<style lang="scss" scoped>
:deep(.o-tag) {
  --tag-color: var(--o-color-white);
  --tag-bd-color: transparent;
  min-width: 56px;

  &.type1 {
    --tag-bg-color: var(--o-color-success1);
  }
  &.type2 {
    --tag-bg-color: #03b5a5;
  }
  &.type3 {
    --tag-bg-color: #f5cd05;
  }
  &.type4 {
    --tag-bg-color: var(--o-color-warning1);
  }
  &.type5 {
    --tag-bg-color: var(--o-color-danger1);
  }
}
.o-table {
  margin: 16px 0;
}
.indicators {
  color: var(--o-color-info1);
  @include text1;
}
</style>
