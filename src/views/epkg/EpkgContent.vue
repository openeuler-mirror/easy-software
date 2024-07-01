<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon, isUndefined, vLoading } from '@opensig/opendesign';

import { getSearchData } from '@/api/api-search';
import { getSearchAllColumn, getSearchAllFiled } from '@/api/api-domain';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getParamsRules } from '@/utils/common';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';
import { useViewStore } from '@/stores/common';
import { useLocale } from '@/composables/useLocale';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const route = useRoute();
const { t } = useI18n();
const { isZh } = useLocale();

// EPKG-表头
const columns = [
  { label: t('software.columns.name'), key: 'name' },
  { label: t('software.columns.version'), key: 'version' },
  { label: t('software.columns.os'), key: 'os' },
  { label: t('software.columns.arch'), key: 'arch' },
  { label: t('software.columns.category'), key: 'category' },
  { label: t('software.columns.timeorder'), key: 'epkgUpdateAt' },
  { label: t('software.columns.size'), key: 'epkgSize' },
  { label: t('software.columns.operation'), key: 'operation' },
];

//  ------------  main ------------

const pkgData = ref([]);

const tabName = ref(TABNAME_OPTIONS[3]);
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
  isLoading.value = true;
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);

  getSearchData(newData)
    .then((res) => {
      if (res.code === 200) {
        pkgData.value = res.data.epkgpkg;
        total.value = res.data.total;
      }
      isLoading.value = false;
      isSearchDocs.value = true;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
      isSearchDocs.value = false;
      useViewStore().showNotFound();
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
  isLoading.value = true;
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
    .catch((err) => {
      if (err.response.data.code === 404) {
        isSearchError.value = true;
      } else {
        useViewStore().showNotFound();
      }
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
    });
};

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === TABNAME_OPTIONS[3]) {
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
  nameOrder.value = '';
  timeOrder.value = '';
  currentPage.value = 1;
};

// 更新时间排序
const changeTimeOrder = (v: string[]) => {
  if (v[0] === 'timeOrder') {
    timeOrder.value = v[1];
    nameOrder.value = '';
  } else if (v[0] === 'nameOrder') {
    nameOrder.value = v[1];
    timeOrder.value = '';
  }
  currentPage.value = 1;
};

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
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
  () => [searchCategory.value, searchOs.value, searchArch.value, nameOrder.value, timeOrder.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// -------------------- 监听 url query 变化 触发搜索 ---------------------
const handleQueryData = () => {
  const query = route.query;
  const { name, tab, key } = query;
  if (!isUndefined(name) && name) {
    searchKey.value = name?.toString();
    currentPage.value = 1;
  } else if (name === '') {
    searchKey.value = '';
    isSearchDocs.value = false;
  }
  if (isValidSearchTabName(tab) && tab) {
    tabName.value = tab as string;
  } else {
    tabName.value = TABNAME_OPTIONS[3];
  }
  // 判断key参数
  if (isValidSearchKey(key) && key) {
    keywordType.value = encodeURIComponent(key as string);
  } else {
    keywordType.value = FLITERMENUOPTIONS[0].id;
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
  <div v-loading.nomask="isLoading" class="pkg-wrap" :class="tabName">
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

    <div class="pkg-content">
      <FilterHeader title="EPKG" @sort="changeTimeOrder" :total="total" />
      <div v-if="isSearchDocs || searchArch.length > 0 || searchOs.length > 0 || searchCategory.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          <template v-if="isSearchDocs">
            为您找到<span class="total">{{ total }}</span
            >个与{{ searchKey }} 匹配的搜索结果</template
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
      <ResultNotApp v-if="pkgData.length === 0 && isSearchError" type="EPKG" />
      <div class="pkg-panel" v-else>
        <OTableItemNew :data="pkgData" :columns="columns" :type="tabName" />
        <div v-if="pkgData.length < total" class="pagination-box">
          <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';
</style>
