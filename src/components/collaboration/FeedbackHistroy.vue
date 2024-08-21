<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { ODialog, OTable, OTag } from '@opensig/opendesign';

import { getMaintainerApply } from '@/api/api-collaboration';
import { formatDateTime } from '@/utils/common';
import { applyStatus } from '@/data/todo';

import { COUNT_PAGESIZE } from '@/data/query';

const props = defineProps({
  repo: {
    type: String,
    default: () => '',
  },
});

const showDlg = ref(true);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const columns = [
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '审批人', key: 'adminstrator', type: 'adminstrator' },
  { label: '审批意见', key: 'comment', type: 'comment' },
  { label: '申请单号', key: 'applyIdString', type: 'applyId' },
  { label: '申请时间', key: 'updateAt', type: 'time' },
];

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const searchParams = computed(() => {
  return {
    name: 'formPage',
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    repo: props.repo,
  };
});

const isLoading = ref(false);
const reposData = ref([]);

const queryMaintainerApply = () => {
  isLoading.value = true;
  getMaintainerApply(searchParams.value)
    .then((res) => {
      if (res.data.list.length > 0) {
        reposData.value = res.data.list;
        total.value = res.data.total;
      } else {
        reposData.value = [];
      }

      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      isLoading.value = false;
    });
};

/* ---------------分页事件------------------ */
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const onChange = () => {
  emits('close');
};

onMounted(() => {
  queryMaintainerApply();
});

watch(
  () => searchParams.value,
  () => {
    queryMaintainerApply();
  },
  { deep: true }
);
</script>

<template>
  <ODialog v-model:visible="showDlg" :unmount-on-hide="true" @change="onChange" size="large">
    <template #header>
      <p class="title">反馈历史</p>
    </template>
    <div class="feedback-histroy">
      <OTable :columns="columns" :data="reposData" :loading="isLoading" border="row">
        <template #head="{ columns }">
          <th v-for="item in columns" :key="item.type" :class="item.type">{{ item.label }}</th>
        </template>
        <template #td_updateAt="{ row }">
          {{ formatDateTime(row.updateAt) }}
        </template>
        <template #td_applyStatus="{ row }">
          <div class="apply-status">
            <OTag v-if="row.applyStatus" :class="row.applyStatus?.toLocaleLowerCase()">{{ applyStatus[row.applyStatus] }} </OTag>
          </div>
        </template>
      </OTable>
      <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
        <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </ODialog>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';
.feedback-histroy {
  :deep(.o-table) {
    .o-table-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      @include scrollbar;
    }
    table {
      table-layout: fixed;
    }
    th {
      width: 168px;
      &.applyStatus {
        width: 120px;
      }
      &.adminstrator {
        width: 120px;
      }
      .time {
        width: 145px;
      }
    }
  }
}
</style>
