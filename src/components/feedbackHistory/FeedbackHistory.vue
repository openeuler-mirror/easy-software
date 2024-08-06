<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue';
import { ORadio, ORadioGroup, OToggle } from '@opensig/opendesign';
import type { FeedbackHistoryT } from '@/@types/feedback';
import type { SorT } from '@/@types/type-sort';
import { getFeedbackList } from '@/api/api-feedback';
import { currentFieldDetailTabInjection, pkgIdInjection } from '@/data/injectionKeys';

import AppPagination from '@/components/AppPagination.vue';
import FilterOrder from '@/components/filter/FilterOrder.vue';
import FeedbackHistoryItem from './FeedbackHistoryItem.vue';

const pkgId = inject<Ref<string>>(pkgIdInjection, ref(''));

// 如果是在领域应用详情内，当前页面选择展示的tab是哪一个
const currentFieldDetailTab = inject<Ref<string> | null>(currentFieldDetailTabInjection, null);

const props = defineProps<{
  /**
   * 如果是在领域应用详情内，当前反馈历史列表所属的tab是哪一个
   */
  fieldDetailTab?: string;
  name: string;
  version: string;
}>();

defineEmits<{
  (event: 'goToUrl', url: string): void;
}>();

/** 是否首次进入 */
let initialized = false;
const showFilter = ref(false);
const filterItems = [
  { label: '全部', value: '' },
  { label: '待办的', value: '待办的' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已拒绝', value: '已拒绝' },
];
const radioVal = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const sort = ref<SorT>('desc');
const totalList = ref<FeedbackHistoryT[]>([]);
const lookupKey = computed(() => `${props.name}-${props.version}`);
const feedbackList = computed(() => totalList.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value));

const queryData = () => {
  if (props.fieldDetailTab && currentFieldDetailTab?.value !== props.fieldDetailTab) {
    return;
  }
  getFeedbackList(1, 1000, radioVal.value, sort.value)
    .then((res) => {
      const { data } = res.data[0];
      totalList.value = data.filter((item) => item.issue_title.endsWith(lookupKey.value));
      if (!initialized) {
        initialized = true;
        if (!totalList.value.length) {
          showFilter.value = false;
        } else {
          showFilter.value = true;
        }
      }
    })
    .catch(() => {
      totalList.value = [];
    })
    .finally(() => {
      totalCount.value = totalList.value.length;
    });
};

queryData();

watch([radioVal, sort], () => {
  currentPage.value = 1;
  queryData();
});

watch(pkgId, () => {
  if (totalList.value.length > 0) {
    return;
  }
  initialized = false;
  showFilter.value = false;
  queryData();
});

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <header class="filter-items" v-if="showFilter">
    <div class="filter-left">
      共{{ totalCount }}条反馈信息
      <ORadioGroup v-model="radioVal" :style="{ '--radio-group-gap': '16px' }">
        <ORadio v-for="item in filterItems" :key="item.value" :value="item.value">
          <template #radio="{ checked }">
            <OToggle :checked="checked" style="--toggle-radius: 4px">
              {{ item.label }}
            </OToggle>
          </template>
        </ORadio>
      </ORadioGroup>
    </div>
    <FilterOrder text="最新" v-model:sort="sort" />
  </header>

  <template v-if="feedbackList.length">
    <FeedbackHistoryItem v-for="(item, index) in feedbackList" :key="index" :feedback="item" @goToUrl="$emit('goToUrl', $event)" />
    <div class="pagination-box">
      <AppPagination :current="currentPage" :pagesize="pageSize" :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </template>
  <p v-else class="not-found">暂无历史反馈信息</p>
</template>

<style scoped lang="scss">
.not-found {
  padding-top: 24px;
  @include tip1;
  color: var(--o-color-info3);
}

.filter-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;

  .filter-left {
    display: flex;
    gap: 16px;
    align-items: center;
    @include tip1;
    color: var(--o-color-info1);
    :deep(.o-radio) {
      @include tip2;
      .o-toggle {
        --toggle-size: 28px;
        --toggle-padding: 0 12px;
        --toggle-bg-color: #f3f3f5;
      }
    }
  }
}

.pagination-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 40px 0;
  :deep(.el-input) {
    --el-input-text-color: var(--o-color-info1);
  }
}
</style>
