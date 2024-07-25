<script setup lang="ts">
import type { FeedbackHistoryT } from '@/@types/feedback';
import type { SorT } from '@/@types/type-sort';
import { getFeedbackList } from '@/api/api-feedback';
import AppPagination from '@/components/AppPagination.vue';
import FilterOrder from '@/components/filter/FilterOrder.vue';
import { inject, ref, watch, type Ref } from 'vue';
import notFoundImage from '@/assets/404.png';
import FeedbackHistoryItem from './FeedbackHistoryItem.vue';
import { ORadio, ORadioGroup, OResult, OToggle } from '@opensig/opendesign';

const pkgId = inject<Ref<string>>('pkgId', ref(''));

const filterItems = [
  { label: '全部', value: '' },
  { label: '开启的', value: '开启的' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已关闭', value: '已关闭' },
];
const radioVal = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const sort = ref<SorT>('');
const feedbackList = ref<FeedbackHistoryT[]>([]);

const queryData = () => {
  getFeedbackList(currentPage.value, pageSize.value, radioVal.value, sort.value)
    .then((res) => {
      const { data } = res.data[0];
      feedbackList.value = data.filter((item) => item.issue_title.endsWith(pkgId.value));
    })
    .catch(() => {
      feedbackList.value = [];
    }).finally(() => {
      totalCount.value = feedbackList.value.length;
    });
};

watch([radioVal, sort], queryData, { immediate: true });

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
    <FeedbackHistoryItem v-for="(item, index) in feedbackList" :key="index" :feedback="item" />
    <div class="pagination-box">
      <AppPagination :current="currentPage" :pagesize="pageSize" :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </template>
  <div v-else class="not-found">
    <OResult>
      <template #image>
        <slot name="image">
          <img class="not-found-image" alt="notFound" :src="notFoundImage" />
        </slot>
      </template>
      <template #extra>
        <p class="text404">暂无数据</p>
      </template>
    </OResult>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  padding-top: 106px;
  padding-bottom: 100px;
}

.filter-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--o-color-control4);

  .filter-left {
    display: flex;
    gap: 16px;
    align-items: center;
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
