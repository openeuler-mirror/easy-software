<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon, isUndefined, isString } from '@opensig/opendesign';
import { getSearchData } from '@/api/api-search';
import { useRoute } from 'vue-router';
import { getSearchAllFiled, getSearchAllColumn } from '@/api/api-domain';
import { useI18n } from 'vue-i18n';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';
import { getParamsRules } from '@/utils/common';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';
import { ElPagination, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const route = useRoute();
const { t } = useI18n();
const { isZh } = useLocale();

// 软件包-表头
const columns = [
  { label: t('software.columns.imageName'), key: 'name' },
  { label: 'Tag', key: 'appVer' },
  { label: t('software.columns.os'), key: 'os' },
  { label: t('software.columns.arch'), key: 'arch' },
  { label: t('software.columns.category'), key: 'category' },
  { label: t('software.columns.operation'), key: 'operation' },
];

//  ------------  main ------------
const pkgData = ref([]);

const tabName = ref(TABNAME_OPTIONS[2]);
const nameOrder = ref('');
const keywordType = ref((route.query.key as string) || '');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');

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
    nameOrder: nameOrder.value,
    os: searchOs.value.join(),
    arch: searchArch.value.join(),
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
        pkgData.value = res.data.apppkg;
        total.value = res.data.total;
        isSearchDocs.value = true;
      }
      isLoading.value = false;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
    })
    .catch(() => {
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
    os: searchOs.value.join(),
    arch: searchArch.value.join(),
    category: searchCategory.value.join(),
    nameOrder: nameOrder.value,
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
    .catch(() => {
      pkgData.value = [];
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === TABNAME_OPTIONS[2]) {
    if (searchKey.value === '') {
      queryAllpkg();
    } else {
      querySearch();
    }
  }
};

// ----------- 左侧菜单交互-------------
// 获取筛选参数列表
const filterArchList = ref<string[]>([]);
const filterOsList = ref<string[]>([]);
const filterCategoryList = ref<string[]>([]);
const isFilterLoading = ref(false);
const queryFilter = () => {
  filterCategoryList.value = [];
  filterOsList.value = [];
  filterArchList.value = [];
  isFilterLoading.value = true;
  getSearchAllColumn({
    name: tabName.value,
    column: 'arch,os,category',
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
  searchArch.value = [];
  searchOs.value = [];
  searchCategory.value = [];
  isSearchDocs.value = false;
  nameOrder.value = '';
};

const filterList = computed(() => {
  return [...searchArch.value, ...searchOs.value, ...searchCategory.value];
});

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
const pageSizes = [10, 24, 48, 96];
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
  queryFilter();
});

watch(
  () => searchParams.value,
  () => {
    pageSearch();
  },
  { deep: true }
);

// 参数变化分页器还原
watch(
  () => [searchCategory.value, searchOs.value, searchArch.value, nameOrder.value],
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
    tabName.value = TABNAME_OPTIONS[2];
  }
  // 判断key参数
  if (isValidSearchKey(key) && key) {
    keywordType.value = encodeURIComponent(key as string);
  } else {
    keywordType.value = FLITERMENUOPTIONS[0].id;
  }
};
handleQueryData();

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
    <div class="filter-sidebar">
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

    <div class="pkg-content">
      <FilterHeader title="容器镜像" :isSort="false" @sort="changeTimeOrder" :total="total" />
      <div v-if="isSearch || filterList.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
        </p>
        <div v-if="filterList.length > 0" class="search-filter-tags">
          <OTag v-for="(item, index) in searchOs" :key="item" closable @Close="closeTag(index, 'os')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchArch" :key="item" closable @Close="closeTag(index, 'arch')">{{ item }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="closeTag(index, 'category')">{{ item }}</OTag>
          <OLink color="primary" class="resetting" @click="resetTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <ResultNotApp v-if="pkgData.length === 0 && isSearchError" />
      <div class="pkg-panel" v-else>
        <OTableItemNew :data="pkgData" :columns="columns" :type="tabName" :loading="isLoading" />
        <div class="pagination-box">
          <el-config-provider :locale="isZh ? zhCn : English">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              background
              layout="sizes, prev, pager, next, jumper"
              :total="total"
              :page-sizes="pageSizes"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </el-config-provider>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';
</style>
