<script lang="ts" setup>
import { ref, onMounted, computed, watch, reactive, type ComponentPublicInstance } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { ODialog, OIcon, OPopover, OPopup, OTable, OTag } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useUserInfoStore } from '@/stores/user';
import { getMaintainerApply, getAdminApply } from '@/api/api-collaboration';
import { formatDateTime } from '@/utils/common';
import { applicationTypeConvert, applyStatusConvert, versionLatestStatusConvert } from '@/utils/collaboration';

import { ElPagination, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

import IconFilter from '~icons/app/icon-filter.svg';
import { COUNT_PAGESIZE } from '@/data/query';
import FilterableCheckboxes from '../FilterableCheckboxes.vue';
import { applicationTypeCurrent, applyStatusType } from '@/data/todo';

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

const filterIconRefs = ref(new Array<ComponentPublicInstance>(columns.length));

/** 筛选组件是否显示的开关 */
const filterSwitches = ref(columns.map(() => false));

const setPopupClickoutSideFn = (el: any, index: number) => {
  onClickOutside(el, () => {
    filterSwitches.value[index] = false;
  });
};

/** 当前有选中筛选项的表格列的数组下标 */
const currentActiveFilterIndices = ref(new Set<number>());

const repoFilterLoading = ref(false);

/** 切换某个筛选组件显示开关 */
const switchFilterVisible = (index: number) => {
  filterSwitches.value[index] = true;
};

/** 各表格列对应的已选中的筛选项 */
const activeFilterValues = ref(new Array<string>(columns.length));

const onFilterChange = (type: string, index: number, val: string) => {
  filterSwitches.value = columns.map(() => false);
  if (val) {
    if (type === 'metric') {
      activeFilterValues.value[index] = applyStatusConvert(val);
    } else {
      activeFilterValues.value[index] = val;
    }
    currentActiveFilterIndices.value.add(index);
  } else {
    activeFilterValues.value[index] = '';
    currentActiveFilterIndices.value.delete(index);
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
  pageInit();
};

const queryMaintainerApply = () => {
  isLoading.value = true;
  getMaintainerApply({ ...searchParams.value, ...filterParams })
    .then((res) => {
      reposData.value = res.data.list;
      total.value = res.data.total;

      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      total.value = 0;
      isLoading.value = false;
    });
};

const queryAdminApply = () => {
  isLoading.value = true;
  getAdminApply({ ...searchParams.value, ...filterParams })
    .then((res) => {
      reposData.value = res.data.list;
      total.value = res.data.total;

      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      total.value = 0;
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

const pageInit = () => {
  if (isAdminPer.value) {
    queryAdminApply();
  } else if (isMainPer.value) {
    queryMaintainerApply();
  }
};

onMounted(() => {
  pageInit();
});

watch(
  () => searchParams.value,
  () => {
    pageInit();
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
            <template v-for="(item, index) in columns" :key="item.type">
              <th v-if="item.key !== 'metric' && item.key !== 'applyStatus'" :class="item.type">{{ item.label }}</th>
              <OPopup v-else trigger="none" style="--popup-radius: 4px" :offset="-8" :visible="filterSwitches[index]" :unmount-on-hide="false" position="bl">
                <template #target>
                  <th :class="item.type">
                    <div class="header-cell">
                      {{ item.label }}
                      <OIcon
                        :ref="(el) => (filterIconRefs[index] = el as ComponentPublicInstance)"
                        class="filter-icon"
                        :style="currentActiveFilterIndices.has(index) ? { color: 'var(--o-color-primary1)' } : {}"
                        @click="switchFilterVisible(index)"
                        ><IconFilter
                      /></OIcon>
                      <OPopover v-if="currentActiveFilterIndices.has(index) && activeFilterValues[index]" :target="filterIconRefs[index]" trigger="hover">
                        <p class="bubble-content">
                          <span class="title">{{ item.label }}:</span>
                          {{ activeFilterValues[index] }}
                        </p>
                      </OPopover>
                    </div>
                  </th>
                </template>
                <div :ref="(el) => setPopupClickoutSideFn(el, index)">
                  <FilterableCheckboxes
                    v-if="item.key === 'metric'"
                    v-model="filterParams[item.key]"
                    :filterable="false"
                    @change="onFilterChange(item.key, index, $event)"
                    :values="applyTypes"
                  />
                  <FilterableCheckboxes
                    v-else
                    v-model="filterParams[item.key]"
                    :loading="repoFilterLoading"
                    :filterable="false"
                    @change="onFilterChange(item.key, index, $event)"
                    :values="applyStatusType"
                  />
                </div>
              </OPopup>
            </template>
          </template>
          <template #td_createdAt="{ row }">
            {{ formatDateTime(row.createdAt, true) }}
          </template>
          <template #td_metric="{ row }">
            {{ applicationTypeConvert(row.metric) }}
          </template>
          <template #td_metricStatus="{ row }">
            {{ versionLatestStatusConvert(row.metricStatus) }}
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
