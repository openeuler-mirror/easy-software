<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon } from '@opensig/opendesign';
import { useRouteQuery } from '@/composables/useRouteQuery';
import { getSearchData } from '@/api/api-search';
import { getSearchAllFiled, getSearchAllColumn } from '@/api/api-domain';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getParamsRules } from '@/utils/common';
import { PACKAGE_TYPE_MAPPING, COUNT_PAGESIZE, SORTPARAMS } from '@/data/query';
import { useViewStore } from '@/stores/common';
import { useSearchStore } from '@/stores/search';
import { useLocale } from '@/composables/useLocale';
import { useDebounceFn } from '@vueuse/core';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import AppLoading from '@/components/AppLoading.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const { locale } = useLocale();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const searchStore = useSearchStore();

// EPKG-表头
const columns = [
  { label: t('software.columns.name'), key: 'name', type: 'name' },
  { label: t('software.columns.version'), key: 'version', type: 'version' },
  { label: t('software.columns.os'), key: 'os', type: 'os' },
  { label: t('software.columns.arch'), key: 'arch', type: 'arch' },
  { label: t('software.columns.category'), key: 'category', type: 'category' },
  { label: t('software.columns.timeorder'), key: 'rpmUpdateAt', type: 'time' },
  { label: t('software.columns.size'), key: 'rpmSize', type: 'size' },
  { label: t('software.columns.operation'), key: 'operation', type: 'operation' },
];

//  ------------  main ------------

const pkgData = ref([]);

const tabName = ref(PACKAGE_TYPE_MAPPING['oepkg']);
const keywordType = ref('');
const isLoading = ref(true);

const searchKey = ref('');
const timeOrder = ref('');
const nameOrder = ref('');

const searchOs = ref<string[]>([]);
const searchArch = ref<string[]>([]);
const searchCategory = ref<string[]>([]);

const searchParams = computed(() => {
  return {
    keyword: searchKey.value,
    keywordType: keywordType.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    dataType: tabName.value,
    os: searchOs.value.join(),
    arch: searchArch.value.join(),
    timeOrder: timeOrder.value,
    nameOrder: nameOrder.value,
    category: searchCategory.value.join(),
  };
});

// es搜索
const querySearch = () => {
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      pkgData.value = res.data.oepkg;
      total.value = res.data.total;
      if (searchStore.nameOrder) {
        searchStore.changeNameOrderCount(total.value);
      }
      isLoading.value = false;
      isSearchDocs.value = true;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
      isSearchError.value = true;
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
      isSearchDocs.value = false;
    });
};

// sql搜索
const isSearchError = ref(false);
// 是否为搜索
const isSearchDocs = ref(false);
const queryAllpkg = () => {
  const params = {
    name: tabName.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    timeOrder: timeOrder.value,
    nameOrder: nameOrder.value,
    os: searchOs.value.join(),
    arch: searchArch.value.join(),
    category: searchCategory.value.join(),
  };
  // 过滤空参数
  const newData = getParamsRules(params);

  getSearchAllFiled(newData)
    .then((res) => {
      pkgData.value = res.data.list;
      total.value = res.data.total;

      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
      isLoading.value = false;
    })
    .catch(() => {
      useViewStore().showNotFound();
      total.value = 0;
      pkgData.value = [];
      isSearchError.value = true;
    });
};

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;

  if (tabName.value === PACKAGE_TYPE_MAPPING['oepkg']) {
    isLoading.value = true;
    if (searchKey.value === '') {
      isSearchDocs.value = false;
      queryAllpkg();
    } else {
      querySearch();
    }
  }
};

// ----------- 左侧菜单交互-------------
// 获取筛选参数列表
const filterOsList = ref<string[]>([]);
const filterArchList = ref<string[]>([]);
const filterCategoryList = ref<string[]>([]);
const isFilterLoading = ref(false);

const queryFilter = () => {
  filterCategoryList.value = [];
  filterOsList.value = [];
  filterArchList.value = [];
  getSearchAllColumn({
    name: tabName.value,
    column: 'os,arch,category',
  })
    .then((res) => {
      const { os, arch, category } = res.data;
      filterCategoryList.value = category;
      filterArchList.value = arch;
      filterOsList.value = os;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const closeTag = (idx: string | number, type: string) => {
  if (type === 'os') {
    searchOs.value.splice(Number(idx), 1);
  } else if (type === 'arch') {
    searchArch.value.splice(Number(idx), 1);
  } else if (type === 'category') {
    searchCategory.value.splice(Number(idx), 1);
  }
};

const filterLength = computed(() => {
  return [...searchOs.value, ...searchArch.value, ...searchCategory.value].length;
});

// 重置筛选结果
const resetTag = () => {
  searchOs.value = [];
  searchArch.value = [];
  searchCategory.value = [];
  isSearchDocs.value = false;
  timeOrder.value = '';
  nameOrder.value = '';
  currentPage.value = 1;

  const { os, arch } = route.query;

  if ((os || arch) && !isPageSearch.value) {
    router.push({
      path: `/${locale.value}/oepkg`,
    });
  }
};

const changeSortBy = (v: string[]) => {
  nameOrder.value = '';
  timeOrder.value = '';
  if (Array.isArray(v)) {
    if (v[0] === 'time') {
      timeOrder.value = SORTPARAMS[v[1]];
    } else if (v[0] === 'name') {
      nameOrder.value = SORTPARAMS[v[1]];
    }
  }
  currentPage.value = 1;
};

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 判断是否是搜索页
const isPageSearch = ref(false);

// 获取路由参数
const { routeKey, routeName, routeType, routeOs, routeArch, routeCategory } = useRouteQuery(PACKAGE_TYPE_MAPPING['oepkg']);

const init = () => {
  searchKey.value = routeKey.value;
  keywordType.value = routeType.value;
  tabName.value = routeName.value;
  searchOs.value = routeOs.value.length ? routeOs.value : searchOs.value;
  searchArch.value = routeArch.value.length ? routeArch.value : searchArch.value;
  searchCategory.value = routeCategory.value.length ? routeCategory.value : searchCategory.value;
};

onMounted(() => {
  isPageSearch.value = route.name === 'search';

  init();
  queryFilter();
});

// 监听领域应用页面搜索，非搜索页面
watch(
  () => route.query,
  () => {
    init();
  }
);

//搜索防抖
const debouncedFn = useDebounceFn(() => {
  pageSearch();
}, 150);

watch(
  () => searchParams.value,
  () => {
    debouncedFn();
  },
  { deep: true }
);

// 除分页器相关请求参数变化，发请求获取新数据
watch(
  () => [searchCategory.value, searchOs.value, searchArch.value, nameOrder.value, timeOrder.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

const changeFilterSearch = (v: string) => {
  searchKey.value = v;
};

const clearFilterSearch = () => {
  searchKey.value = '';
};
</script>

<template>
  <div class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar" flex="0 0 25%">
      <template v-if="isFilterLoading"><FilterItemSkeleton v-for="tag in 3" :key="tag" /></template>
      <template v-else>
        <FilterCheckbox v-if="filterOsList.length" v-model="searchOs" :options="filterOsList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconOs /></OIcon>{{ t('software.filterSider.os') }}
            </div>
          </template>
        </FilterCheckbox>
        <FilterCheckbox v-if="filterArchList.length" v-model="searchArch" :options="filterArchList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconArch /></OIcon>{{ t('software.filterSider.arch') }}
            </div>
          </template>
        </FilterCheckbox>

        <FilterCheckbox v-if="filterCategoryList.length" v-model="searchCategory" :options="filterCategoryList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconCategory /></OIcon>{{ t('software.filterSider.category') }}
            </div>
          </template>
        </FilterCheckbox>
      </template>
    </div>

    <div class="pkg-main">
      <FilterHeader title="OEPKG" :total="total" @search="changeFilterSearch" @clear="clearFilterSearch" />
      <div v-if="isSearchDocs || filterLength > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          <template v-if="isSearchDocs">
            为您找到<span class="total">{{ total }}</span
            >个与<span class="search-value">{{ searchKey }}</span
            >匹配的搜索结果
          </template>
          <template v-else>
            为您找到符合条件的筛选<span class="total">{{ total }}</span
            >个</template
          >
        </p>
        <div class="search-filter-tags">
          <OTag v-for="(item, index) in searchOs" :key="item" closable @Close="closeTag(index, 'os')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchArch" :key="item" closable @Close="closeTag(index, 'arch')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="closeTag(index, 'category')">{{ item }}</OTag>
          <OLink v-if="filterLength > 0" color="primary" class="resetting" @click="resetTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <div class="pkg-content" :class="pkgData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" type="OEPKG" />
        <div v-if="pkgData.length !== 0 && !isSearchError" class="pkg-panel">
          <OTableItemNew :data="pkgData" :columns="columns" :type="tabName" @sort="changeSortBy" />
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
