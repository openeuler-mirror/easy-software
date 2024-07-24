<script setup lang="ts">
import type { FeedbackHistoryT } from '@/@types/feedback';
import type { SorT } from '@/@types/type-sort';
import { getFeedbackList } from '@/api/api-feedback';
import AppPagination from '@/components/AppPagination.vue';
import FilterOrder from '@/components/filter/FilterOrder.vue';
import { computed, inject, ref, watch, type Ref } from 'vue';
import FeedbackHistoryItem from './FeedbackHistoryItem.vue';

const pkgId = inject<Ref<string>>('pkgId', ref(''));

const filterItems = [
  { label: '全部', value: '' },
  { label: '开启的', value: '开启的' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已关闭', value: '已关闭' },
];
const activeFilterItemIndex = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const feedbackList = ref<FeedbackHistoryT[]>([]);
const currentFilterItem = computed(() => filterItems[activeFilterItemIndex.value].value);

const queryData = (sort?: SorT) => {
  getFeedbackList(currentPage.value, pageSize.value, currentFilterItem.value, sort)
    .then((res) => {
      const { data } = res.data[0];
      feedbackList.value = data.filter((item) => item.issue_title.endsWith(pkgId.value));
      totalCount.value = feedbackList.value.length;
    })
    .catch(() => (feedbackList.value = []));
};

watch(currentFilterItem, () => queryData(), { immediate: true });

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  queryData();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  queryData();
};
</script>

<template>
  <header class="filter-items">
    <div class="filter-left">
      共{{ totalCount }}条反馈信息
      <span v-for="(item, index) in filterItems" :key="item.value" :active="index === activeFilterItemIndex" @click="activeFilterItemIndex = index">{{
        item.label
      }}</span>
    </div>
    <FilterOrder text="最新" @change="queryData" />
  </header>

  <div>
    <FeedbackHistoryItem v-for="(item, index) in feedbackList" :key="index" :feedback="item" />
  </div>

  <div class="pagination-box">
    <AppPagination :current="currentPage" :pagesize="pageSize" :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<style scoped lang="scss">
.filter-items {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filter-left {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  span {
    cursor: pointer;
    padding: 6px 12px;
    border-radius: var(--o-radius-xs);
    background-color: rgb(var(--o-mixedgray-2));

    &[active='true'] {
      background-color: var(--o-white);
      outline: 1px solid var(--o-color-primary1);
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
