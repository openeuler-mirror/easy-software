<script lang="ts" setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { ODialog, OTable, OTag } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useUserInfoStore } from '@/stores/user';
import { getCollaborationApply } from '@/api/api-collaboration';
import { formatDateTime } from '@/utils/common';
import { applicationTypeConvert, applyStatusConvert } from '@/utils/collaboration';

import { ElPagination, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

import { COUNT_PAGESIZE } from '@/data/query';
import { applicationTypeCurrent, applyStatusType } from '@/data/todo';
import FilterableTableHeader from '../FilterableTableHeader.vue';

const props = defineProps({
  repo: {
    type: String,
    default: () => '',
  },
});

const { isZh } = useLocale();
const showDlg = ref(true);
const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const columns = [
  { label: '申请类型', key: 'metric', type: 'metric' },
  { label: '修改状态', key: 'metricStatus', type: 'metricStatus' },
  { label: '修改理由', key: 'description', type: 'description' },
  { label: '申请状态', key: 'applyStatus', type: 'applyStatus' },
  { label: '审批人', key: 'administrator', type: 'administrator' },
  { label: '审批意见', key: 'comment', type: 'comment' },
  { label: '申请单号', key: 'applyIdString', type: 'applyId' },
  { label: '申请时间', key: 'createdAt', type: 'time' },
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

const applyTypes = applicationTypeCurrent.map((item) => ({ label: item.label, value: item.id }));

const filterParams = reactive({
  metric: '',
  applyStatus: '',
});

const onFilterChange = (type: keyof typeof filterParams, val: string | number | (string | number)[]) => {
  if ((Array.isArray(val) && val.length) || (!Array.isArray(val) && val)) {
    val = Array.isArray(val) ? val.join() : val.toString();
    filterParams[type] = val;
  } else {
    filterParams[type] = '';
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
  queryMaintainerApply();
};

const queryMaintainerApply = async () => {
  isLoading.value = true;
  const params = { ...searchParams.value, ...filterParams };
  try {
    if (isAdminPer.value) {
      const { data } = await getCollaborationApply(params, 'admin');
      reposData.value = data.list;
      total.value = data.total;
    } else if (isMainPer.value) {
      const { data } = await getCollaborationApply(params, 'maintainer');
      reposData.value = data.list;
      total.value = data.total;
    }

    isLoading.value = false;
  } catch {
    reposData.value = [];
    total.value = 0;
    isLoading.value = false;
  }
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
      <div class="histroy-table" :class="{ total: total > COUNT_PAGESIZE[0] }">
        <OTable :columns="columns" :data="reposData" :loading="isLoading" border="row" :small="true">
          <template #head="{ columns }">
            <template v-for="(item) in columns" :key="item.type">
              <th v-if="item.key !== 'metric' && item.key !== 'applyStatus'" :class="item.type">{{ item.label }}</th>
              <th :class="item.type" v-else>
                <FilterableTableHeader
                  v-if="item.key === 'metric'"
                  :model-value="filterParams[item.key]"
                  :filterable="false"
                  @change="onFilterChange(item.key, $event)"
                  :options="applyTypes"
                >
                  {{ item.label }}
                </FilterableTableHeader>
                <FilterableTableHeader
                  v-else
                  :model-value="filterParams[item.key]"
                  :filterable="false"
                  multi
                  :filter-values-display-mapper="applyStatusConvert"
                  @change="onFilterChange(item.key, $event)"
                  :options="applyStatusType"
                >
                  {{ item.label }}
                </FilterableTableHeader>
              </th>
            </template>
          </template>
          <template #td_createdAt="{ row }">
            {{ formatDateTime(row.createdAt, true) }}
          </template>
          <template #td_metric="{ row }">
            {{ applicationTypeConvert(row.metric) }}
          </template>
          <template #td_metricStatus="{ row }">
            {{ row.metricStatus }}
          </template>
          <template #td_administrator="{ row }">
            {{ row.administrator ?? '-' }}
          </template>
          <template #td_description="{ row }">
            <TableShowOverflowTips v-if="row.description" :content="row.description" :line="1" wrapper=".histroy-table" />
            <template v-else>-</template>
          </template>
          <template #td_applyIdString="{ row }">
            <TableShowOverflowTips v-if="row.applyIdString" :content="row.applyIdString" :line="1" wrapper=".histroy-table" />
            <template v-else>-</template>
          </template>
          <template #td_comment="{ row }">
            <TableShowOverflowTips v-if="row.comment" :content="row.comment" :line="1" wrapper=".histroy-table" />
            <template v-else>-</template>
          </template>
          <template #td_applyStatus="{ row }">
            <div class="apply-status">
              <OTag v-if="row.applyStatus" :class="row.applyStatus?.toLocaleLowerCase()">{{ applyStatusConvert(row.applyStatus) }} </OTag>
            </div>
          </template>
        </OTable>
      </div>
      <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
        <el-config-provider :locale="isZh ? zhCn : English">
          <el-pagination
            :current-page="currentPage"
            background
            layout="total , prev, pager, next, jumper"
            :total="total"
            :page-sizes="COUNT_PAGESIZE"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-config-provider>
      </div>
    </div>
  </ODialog>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';
.pagination-box {
  margin-top: 24px;
  display: flex;
  justify-content: end;
}
.feedback-histroy {
  .histroy-table {
    border: 1px solid var(--o-color-control4);
    border-radius: 4px;
    position: relative;
    &.total {
      :deep(.o-table-wrap) {
        height: 538px;
      }
    }
  }
  :deep(.o-table) {
    .o-table-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      @include scrollbar;
      &::-webkit-scrollbar {
        height: 6px;
      }
    }
    table {
      table-layout: fixed;
    }
    th {
      width: 168px;
      @include tip1;
      &.applyStatus {
        width: 120px;
      }
      &.administrator {
        width: 120px;
      }
      .time {
        width: 145px;
      }
    }
    .td-nowrap {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
}
</style>
