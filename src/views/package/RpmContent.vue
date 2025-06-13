<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRouteQuery } from '@/composables/useRouteQuery';
import { getSearchData } from '@/api/api-search';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { getSearchAllFiled, getSearchAllColumn } from '@/api/api-domain';
import { PACKAGE_TYPE_MAPPING, COUNT_PAGESIZE, SORTPARAMS } from '@/data/query';
import { getParamsRules } from '@/utils/common';
import { useViewStore } from '@/stores/common';
import { useSearchStore } from '@/stores/search';
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

const columns = [
  { label: t('software.columns.name'), key: 'name', type: 'name' },
  { label: t('software.columns.version'), key: 'version', type: 'version' },
  { label: t('software.columns.os'), key: 'os', type: 'os' },
  { label: t('software.columns.arch'), key: 'arch', type: 'arch' },
  { label: t('software.columns.category'), key: 'category', type: 'category' },
  { label: t('software.columns.subPath'), key: 'subPath', type: 'sub-path' },
  { label: t('software.columns.timeorder'), key: 'rpmUpdateAt', type: 'time' },
  { label: t('software.columns.size'), key: 'rpmSize', type: 'size' },
  { label: t('software.columns.operation'), key: 'operation', type: 'operation' },
];

//  ------------  main ------------
const pkgData = ref([]);

const tabName = ref(PACKAGE_TYPE_MAPPING['rpmpkg']);
const keywordType = ref('');
const isLoading = ref(false);
const timeOrder = ref('');
const nameOrder = ref('');

const searchKey = ref('');

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
const isSearchError = ref(false);
const isSearchDocs = ref(false);
// es搜索
const querySearch = () => {
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      pkgData.value = res.data.rpmpkg;
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
const queryAllpkg = () => {
  const params = {
    name: tabName.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    os: searchOs.value.join(),
    arch: searchArch.value.join(),
    timeOrder: timeOrder.value,
    nameOrder: nameOrder.value,
    category: searchCategory.value.join(),
  };

  // 过滤空参数
  const newData = getParamsRules(params);

  getSearchAllFiled(newData)
    .then((res) => {
      pkgData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
      useViewStore().showNotFound();
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
      isSearchError.value = true;
    });
};

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;

  if (tabName.value === PACKAGE_TYPE_MAPPING['rpmpkg']) {
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
  filterOsList.value = [];
  filterArchList.value = [];
  filterCategoryList.value = [];

  getSearchAllColumn({
    name: tabName.value,
    column: 'os,arch,category',
  })
    .then((res) => {
      const { os, arch, category } = res.data;
      filterCategoryList.value = category;
      filterOsList.value = os;
      filterArchList.value = arch;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const handleCloseTag = (idx: string | number, type: string) => {
  if (type === 'os') {
    searchOs.value.splice(Number(idx), 1);
  }
  if (type === 'arch') {
    searchArch.value.splice(Number(idx), 1);
  }
  if (type === 'category') {
    searchCategory.value.splice(Number(idx), 1);
  }
};

// 重置筛选结果
const handleResettingTag = () => {
  searchOs.value = [];
  searchArch.value = [];
  searchCategory.value = [];
  isSearchDocs.value = false;
  nameOrder.value = '';
  timeOrder.value = '';
  currentPage.value = 1;

  const { os, arch } = route.query;

  if (os || arch) {
    router.push({
      path: `/${locale.value}/rpm`,
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
const { routeKey, routeName, routeType, routeOs, routeArch, routeCategory } = useRouteQuery(PACKAGE_TYPE_MAPPING['rpmpkg']);

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

const changeFilterSearch = (v: string) => {
  searchKey.value = v;
};

const clearFilterSearch = () => {
  searchKey.value = '';
};

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

// 参数变化分页器还原
watch(
  () => [searchCategory.value, searchOs.value, searchArch.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
</script>

<template>
  <div class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar">
      <div v-loading.nomask="isFilterLoading">
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
      </div>
    </div>

    <div class="pkg-main">
      <FilterHeader title="RPM" :total="total" @search="changeFilterSearch" @clear="clearFilterSearch" />
      <div v-if="isSearchDocs || searchArch.length > 0 || searchOs.length > 0 || searchCategory.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          <template v-if="isSearchDocs">
            为您找到<span class="total">{{ total }}</span
            >个与<span class="search-value">{{ searchKey }}</span
            >匹配的搜索结果</template
          >
          <template v-else>
            为您找到符合条件的筛选<span class="total">{{ total }}</span
            >个</template
          >
        </p>
        <div class="search-filter-tags">
          <OTag v-for="(item, index) in searchOs" :key="item" closable @Close="handleCloseTag(index, 'os')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchArch" :key="item" closable @Close="handleCloseTag(index, 'arch')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="handleCloseTag(index, 'category')">{{ item }}</OTag>
          <OLink
            v-if="searchArch.length > 0 || searchOs.length > 0 || searchCategory.length > 0"
            color="primary"
            class="resetting"
            @click="handleResettingTag"
            >{{ t('software.filterSider.clear') }}</OLink
          >
        </div>
      </div>
      <div class="pkg-content" :class="pkgData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" type="RPM" />
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
