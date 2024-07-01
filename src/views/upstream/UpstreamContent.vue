<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { OTag, OLink, OIcon, OTable, vLoading } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getParamsRules } from '@/utils/common';
import { getUpstreamColumn, getUpstream } from '@/api/api-upstream';
import { getSearchData } from '@/api/api-search';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';

import FilterRadio from '@/components/filter/FilterRadio.vue';
import IconOs from '~icons/pkg/icon-os.svg';

const route = useRoute();
const { t } = useI18n();
const { isZh } = useLocale();

// 软件包-表头
const columns = [
  { label: '应用名称', key: 'name', style: 'width:27%' },
  { label: '上游最新版本', key: 'upstreamVersion', style: 'width:27%' },
  { label: '兼容版本', key: 'openeulerVersion', style: 'width:27%' },
  { label: '状态', key: 'status', style: 'width:19%' },
];

//  ------------  main ------------

const appData = ref([]);

const tabName = ref('appversion');
const nameOrder = ref('');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');
const searchOs = ref('');

const queryAppVersion = () => {
  isLoading.value = true;
  const params = {
    eulerOsVersion: searchOs.value,
    pageNum: currentPage.value,
    nameOrder: nameOrder.value,
    pageSize: pageSize.value,
  };

  // 过滤空参数
  const newData = getParamsRules(params);
  getUpstream(newData)
    .then((res) => {
      appData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {
      appData.value = [];
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

const searchParams = computed(() => {
  return {
    keyword: searchKey.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    dataType: 'appversion',
    eulerOsVersion: searchOs.value,
    nameOrder: nameOrder.value,
  };
});

// es搜索
const isSearchError = ref(false);
const isSearch = ref(false);
const querySearch = () => {
  isLoading.value = true;

  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      if (res.code === 200) {
        appData.value = res.data.appversion;
        total.value = res.data.total;
      }
      isLoading.value = false;
      isSearch.value = true;
      if (appData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
      appData.value = [];
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

// ----------- 左侧菜单交互-------------
// 获取筛选参数列表
const filterOsList = ref<string[]>([]);
const isFilterLoading = ref(false);
const queryFilter = () => {
  filterOsList.value = [];
  isFilterLoading.value = true;
  getUpstreamColumn('eulerOsVersion')
    .then((res) => {
      filterOsList.value = res.data.eulerOsVersion;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const handleCloseTag = (type: string) => {
  if (type === 'os') {
    searchOs.value = '';
  }
};

// 重置筛选结果
const handleResettingTag = () => {
  searchOs.value = '';
  nameOrder.value = '';
  isSearch.value = false;
};

// 更新时间、字母排序
const changeTimeOrder = (v: string[]) => {
  if (v[0] === 'nameOrder') {
    nameOrder.value = v[1];
  }
};

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  queryAppVersion();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  queryAppVersion();
};

// 判断是否是搜索页
const isPageSearch = ref(false);

onMounted(() => {
  isPageSearch.value = route.name === 'search';

  pageSearch();
  queryFilter();
});

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === 'appversion') {
    if (searchKey.value === '') {
      queryAppVersion();
    } else {
      querySearch();
    }
  }
};

watch(
  () => [searchOs.value, nameOrder.value],
  () => {
    currentPage.value = 1;
    pageSearch();
  }
);

watch(
  () => route.query.name as string,
  (v: string) => {
    if (searchKey.value !== v && v !== undefined) {
      searchKey.value = v;
    }
    if (v === '') {
      searchKey.value = '';
      isSearch.value = false;
    }
    currentPage.value = 1;
    pageSearch();
  }
);
</script>

<template>
  <div v-loading.nomask="isLoading" class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar">
      <template v-if="isFilterLoading"><FilterItemSkeleton /></template>
      <template v-else>
        <FilterRadio v-if="filterOsList.length" v-model="searchOs" :options="filterOsList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconOs /></OIcon>{{ t('software.filterSider.os') }}
            </div>
          </template>
        </FilterRadio>
      </template>
    </div>
    <div class="pkg-content">
      <FilterHeader title="应用名称" :isSort="false" @sort="changeTimeOrder" :total="total" />
      <div v-if="searchOs || isSearch" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
        </p>
        <div class="search-filter-tags">
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OLink v-if="searchOs" color="primary" class="resetting" @click="handleResettingTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <ResultNotApp v-if="appData.length === 0 && isSearchError" type="上游兼容应用全景" />
      <div class="pkg-panel" v-else>
        <OTable :columns="columns" :data="appData" border="all">
          <template #td_name="{ row }">
            <span v-dompurify-html="row.name"></span>
          </template>
          <template #td_upstreamVersion="{ row }">
            {{ row.upstreamVersion }}
          </template>
          <template #td_compatibleVersion="{ row }">
            {{ row.compatibleVersion }}
          </template>
          <template #td_status="{ row }">
            <OTag v-if="row.status" class="app-tag" :class="row.status.toLocaleLowerCase()">{{ row.status }} </OTag>
          </template>
        </OTable>
        <div v-if="appData.length < total" class="pagination-box">
          <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';
.app-tag {
  min-width: 92px;
  color: var(--o-color-white);
  &.outdated {
    --tag-bg-color: #058ef0;
    --tag-bd-color: #058ef0;
  }
  &.ok {
    --tag-bg-color: #0bb151;
    --tag-bd-color: #0bb151;
  }
  &.missing {
    --tag-bg-color: #c7000b;
    --tag-bd-color: #c7000b;
  }
}

:deep(.o-table) {
  --table-edge-padding: 24px;
  --table-cell-padding: 12px 16px;
  --table-head-cell-padding: 12px 16px;
}
</style>
