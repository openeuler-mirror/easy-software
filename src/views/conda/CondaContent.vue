<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon, isUndefined } from '@opensig/opendesign';

import { getSearchData } from '@/api/api-search';
import { getSearchAllColumn, getSearchAllFiled } from '@/api/api-domain';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';
import { getParamsRules } from '@/utils/common';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS, COUNT_PAGESIZE, SORTPARAMS } from '@/data/query';
import { useViewStore } from '@/stores/common';
import { useSearchStore } from '@/stores/search';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import AppLoading from '@/components/AppLoading.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { locale } = useLocale();
const searchStore = useSearchStore();

// EPKG-表头
const columns = [
  { label: t('software.columns.name'), key: 'name', type: 'name' },
  { label: t('software.columns.version'), key: 'appVer', type: 'version' },
  { label: t('software.columns.os'), key: 'os', type: 'os' },
  { label: t('software.columns.arch'), key: 'arch', type: 'arch' },
  { label: t('software.columns.category'), key: 'category', type: 'category' },
];

//  ------------  main ------------

const pkgData = ref([]);
const PAGE_ID = 'CONDA';
const tabName = ref(TABNAME_OPTIONS[5]);
const keywordType = ref((route.query.key as string) || '');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');
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
    dataType: 'conda',
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
      pkgData.value = res.data.condapkg;
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
    });
};

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === TABNAME_OPTIONS[5]) {
    isLoading.value = true;
    if (searchKey.value === '') {
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
  isFilterLoading.value = true;
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

const closeTag = (idx: string | number, type: string) => {
  if (type === 'os') {
    searchOs.value.splice(Number(idx), 1);
  } else if (type === 'arch') {
    searchArch.value.splice(Number(idx), 1);
  } else if (type === 'category') {
    searchCategory.value.splice(Number(idx), 1);
  }
};

// 重置筛选结果
const resetTag = () => {
  searchOs.value = [];
  searchArch.value = [];
  searchCategory.value = [];
  isSearchDocs.value = false;

  timeOrder.value = '';
  nameOrder.value = '';

  currentPage.value = 1;

  if (route.query.os || route.query.arch) {
    router.push({
      path: `/${locale.value}/conda`,
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

onMounted(() => {
  isPageSearch.value = route.name === 'search';
  if (isPageSearch.value) {
    pageSearch();
  }

  queryFilter();
  handleQueryData();
});

watch(
  () => searchParams.value,
  () => {
    pageSearch();
  },
  { deep: true }
);

// 除分页器相关请求参数变化，发请求获取新数据
watch(
  () => [searchCategory.value, searchOs.value, searchArch.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// -------------------- 监听 url query 变化 触发搜索 ---------------------
const handleQueryData = () => {
  const query = route.query;
  const { name, tab, key, os, arch } = query;
  if (!isUndefined(name) && name) {
    searchKey.value = name?.toString();
    currentPage.value = 1;
  } else {
    searchKey.value = '';
    isSearchDocs.value = false;
  }

  if (isValidSearchTabName(tab) && tab) {
    tabName.value = tab as string;
  } else {
    tabName.value = TABNAME_OPTIONS[5];
  }
  // 判断key参数
  if (isValidSearchKey(key) && key) {
    keywordType.value = encodeURIComponent(key as string);
  } else {
    keywordType.value = FLITERMENUOPTIONS[0].id;
  }

  // 首页社区版本跳转
  if (!isUndefined(os) && os) {
    searchOs.value.push(os?.toString());
  }
  if (!isUndefined(arch) && arch) {
    searchArch.value.push(arch?.toString());
  }
};

watch(
  () => route.query,
  () => {
    handleQueryData();
  },
  { deep: true }
);
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
      <FilterHeader :title="PAGE_ID" :total="total" />
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
          <OTag v-for="(item, index) in searchOs" :key="item" closable @Close="closeTag(index, 'os')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchArch" :key="item" closable @Close="closeTag(index, 'arch')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="closeTag(index, 'category')">{{ item }}</OTag>

          <OLink v-if="searchArch.length > 0 || searchOs.length > 0 || searchCategory.length > 0" color="primary" class="resetting" @click="resetTag">{{
            t('software.filterSider.clear')
          }}</OLink>
        </div>
      </div>
      <div class="pkg-content" :class="pkgData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" :type="PAGE_ID" />
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
