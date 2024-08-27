<script lang="ts" setup>
import { ref, computed } from 'vue';
import { OTable, OTag, ODialog } from '@opensig/opendesign';
import { repoStatusIndex } from '@/utils/collaboration';
import { applicationType } from '@/data/todo/';

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
    maintenance: '没有人维护',
    description: 'CVE全部未修复，且没有ISSUE修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部未修复',
    contribution: '有部分ISSUE修复',
    details: '-',
    maintenance: '缺人维护',
    description: 'CVE全部未修复，且有部分ISSUE被修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部未修复',
    contribution: '全部ISSUE修复',
    details: '-',
    maintenance: '缺人维护',
    description: 'CVE全部未修复，全部ISSUE都被修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE部分修复',
    contribution: '-',
    details: '-',
    maintenance: '缺人维护',
    description: 'CVE部分修复',
  },
  {
    cve: '有CVE',
    cveType: 'CVE全部修复',
    contribution: '-',
    details: '-',
    maintenance: '健康',
    description: 'CVE全部修复',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '没有PR提交',
    details: '版本正常',
    maintenance: '健康',
    description: '没有CVE问题，且也没有PR提交，且软件包是正常稳定的',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '没有PR提交',
    details: '落后版本',
    maintenance: '静止',
    description: '没有CVE问题，且也没有PR提交，且软件包是落后版本',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '有PR合入',
    details: '-',
    maintenance: '活跃',
    description: '没有CVE问题，有PR合入',
  },
  {
    cve: '没有CVE',
    cveType: '没有CVE问题',
    contribution: '有PR提交未合入',
    details: '-',
    maintenance: '活跃',
    description: '没有CVE问题，有PR提交但是没有PR被合入',
  },
];

const applicationTypeDesc: Record<string, string[]> = {
  cveStatus: [],
  issueStatus: ['所有Issue都没有被修复', '一部分Issue被修复了，一部分Issue没有修复', '所有Issue都被修复了'],
  prStatus: ['-', '有PR提交，且都没有被合入代码仓', '有PR提及，且有PR被合入到代码仓'],
  versionStatus: ['软件包版本与上游版本一致', '软件包版本比上游版本低'],
  orgStatus: ['参与贡献组织数 > 5人', '参与贡献组织数 <= 5人'],
  contributorStatus: ['参与贡献人数 > 10人', '参与贡献人数 <= 10人'],
};

const indicatorsInfo = computed(() => {
  return applicationType.map((item) => {
    return { ...item, desc: applicationTypeDesc[item.id] || [] };
  });
});

console.log('indicatorsInfo', indicatorsInfo.value);

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
      <OTable class="main-table" :columns="columns" :data="data" :cell-span="cellSpanFn" border="all" :small="true">
        <template #td_maintenance="{ row }">
          <div class="repo-status">
            <OTag :class="`type${repoStatusIndex(row.maintenance)}`" size="small">{{ row.maintenance }} </OTag>
          </div>
        </template>
      </OTable>
      <p class="title">详细指标</p>
      <div v-for="item in indicatorsInfo" :key="item.id" class="indicators-info">
        <div class="title">{{ item.label }}</div>
        <div class="box">
          <div v-for="(child, index) in item.children" :key="child" class="rows">
            <span class="child"> {{ child }}</span> <span v-if="item.desc[index]" class="desc">{{ item.desc[index] }}</span>
          </div>
        </div>
      </div>
    </div>
  </ODialog>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';

:deep(.o-table) {
  margin: 16px 0;
  tbody {
    tr {
      &:hover {
        background: none !important;
      }
    }
  }
  td[rowspan='4'] {
    border-bottom: 0 none;
  }
}
.indicators {
  color: var(--o-color-info1);
  @include text1;
}

.indicators-info {
  --indicators-border: 1px solid var(--o-color-control4);
  border: var(--indicators-border);
  display: flex;
  margin-top: 16px;
  border-radius: 4px;
  @include tip1;
  .title {
    background: var(--o-color-control3-light);
    display: flex;
    align-items: center;
    width: 195px;
    font-weight: 500;
    justify-content: center;
  }
  .box {
    flex: 1;
    border-left: var(--indicators-border);
    .rows {
      &:not(:last-child) {
        border-bottom: var(--indicators-border);
      }
      color: var(--o-color-info1);

      display: flex;
      align-items: center;
      span {
        padding: 12px 16px;
        display: block;
      }
      .child {
        padding-left: 78px;
      }
      .desc {
        flex: 1;
      }
      .child:has(+ span) {
        width: 40%;
        border-right: var(--indicators-border);
      }
    }
  }
}
</style>
