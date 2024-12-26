<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { OTag, OLink, OIcon } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getParamsRules } from '@/utils/common';
import { getUpstreamColumn, getUpstream } from '@/api/api-upstream';
import { getSearchData } from '@/api/api-search';
import { useViewStore } from '@/stores/common';
import { COUNT_PAGESIZE, SORTPARAMS } from '@/data/query';

import FilterRadio from '@/components/filter/FilterRadio.vue';
import AppLoading from '@/components/AppLoading.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconAppType from '~icons/pkg/icon-app-type.svg';
import IconStatus from '~icons/pkg/icon-status.svg';
import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';

const route = useRoute();
const { t } = useI18n();

// 软件包-表头
const columns = [
  { label: t('upstream.name'), key: 'name', style: 'width:27%', type: 'name' },
  { label: t('upstream.version'), key: 'upstreamVersion', style: 'width:27%', type: 'upstreamVersion' },
  { label: t('upstream.compatibility'), key: 'openeulerVersion', style: 'width:27%', type: 'openeulerVersion' },
  { label: t('upstream.state'), key: 'status', style: 'width:19%', type: 'status' },
];

//  ------------  main ------------

const appData = ref([]);

const tabName = ref('appversion');
const nameOrder = ref('');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');
const searchOs = ref('');
const searchType = ref('');
const searchStatus = ref<string[]>([]);

const queryAppVersion = () => {
  const params = {
    eulerOsVersion: searchOs.value,
    type: searchType.value,
    status: searchStatus.value.join(),
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

const searchParams = computed(() => {
  return {
    keyword: searchKey.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    dataType: 'appversion',
    eulerOsVersion: searchOs.value,
    type: searchType.value,
    status: searchStatus.value.join(),
    nameOrder: nameOrder.value,
  };
});

// es搜索
const isSearchError = ref(false);
const isSearch = ref(false);
const querySearch = () => {
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      appData.value = res.data.appversion;
      total.value = res.data.total;
      isLoading.value = false;
      isSearch.value = true;
      if (appData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
      isSearchError.value = true;
      appData.value = [];
      isLoading.value = false;
    });
};

// ----------- 左侧菜单交互-------------
// 获取筛选参数列表
const OTHER = { label: '其他', value: '其他' };
const filterOsList = ref<string[]>([]);
const appTypeList = ref<{ label: string; value: string }[]>([]);
const statusList = ref<string[]>([]);
const isFilterLoading = ref(false);
const appTypeListDisplayNames: Record<string, string> = {
  rpm: 'RPM',
  image: '应用镜像',
};
const queryFilter = () => {
  filterOsList.value = [];
  isFilterLoading.value = true;
  getUpstreamColumn('eulerOsVersion,type,status')
    .then((res) => {
      filterOsList.value = res.data.eulerOsVersion;
      appTypeList.value = res.data.type.map((item: string) => ({ label: appTypeListDisplayNames[item], value: item }));
      appTypeList.value.push(OTHER);
      statusList.value = res.data.status;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const showSearchFilterTags = computed(() => searchType.value || searchStatus.value.length || searchOs.value);

const handleCloseTag = (type: string, index?: number) => {
  if (type === 'os') {
    searchOs.value = '';
  } else if (type === 'type') {
    searchType.value = '';
  } else if (type === 'category') {
    searchStatus.value.splice(Number(index), 1);
  }
};

// 重置筛选结果
const handleResettingTag = () => {
  searchOs.value = '';
  searchStatus.value = [];
  searchType.value = '';
  nameOrder.value = '';
  isSearch.value = false;
};

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  pageSearch();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  pageSearch();
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
    isLoading.value = true;
    if (searchKey.value === '') {
      queryAppVersion();
    } else {
      querySearch();
    }
  }
};

const changeSortBy = (v: string[]) => {
  nameOrder.value = '';
  if (Array.isArray(v)) {
    if (v[0] === 'name') {
      nameOrder.value = SORTPARAMS[v[1]];
    }
  }
  currentPage.value = 1;
};

watch(
  () => [searchOs.value, nameOrder.value, searchType.value, searchStatus.value],
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
  <div class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar">
      <template v-if="isFilterLoading"><FilterItemSkeleton /></template>
      <template v-else>
        <FilterRadio v-if="appTypeList.length" v-model="searchType" :options="appTypeList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconAppType /></OIcon>应用类型
            </div>
          </template>
        </FilterRadio>
        <FilterRadio v-if="filterOsList.length" v-model="searchOs" :options="filterOsList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconOs /></OIcon>{{ t('software.filterSider.os') }}
            </div>
          </template>
        </FilterRadio>
        <FilterCheckbox v-if="statusList.length" v-model="searchStatus" :options="statusList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconStatus /></OIcon>状态
            </div>
          </template>
        </FilterCheckbox>
      </template>
    </div>
    <div class="pkg-main">
      <FilterHeader :title="t('upstream.name')" :total="total" />
      <div v-if="searchOs || isSearch || showSearchFilterTags" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
        </p>
        <div v-if="showSearchFilterTags" class="search-filter-tags">
          <OTag v-for="(item, index) in searchStatus" :key="item" closable @Close="handleCloseTag('category', index)">{{ item }}</OTag>
          <OTag v-if="searchType" closable @Close="handleCloseTag('type')">{{ searchType === '其他' ? '其他' : appTypeListDisplayNames[searchType] }}</OTag>
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OLink color="primary" class="resetting" @click="handleResettingTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <div class="pkg-content" :class="appData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" :type="t('upstream.title')" />
        <div v-if="appData.length !== 0 && !isSearchError" class="pkg-panel">
          <OTableItemNew :data="appData" :columns="columns" :type="tabName" @sort="changeSortBy" />

          <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';
</style>
