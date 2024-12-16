<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { ORow, OCol, OTag, OLink, OIcon, isUndefined } from '@opensig/opendesign';
import { getSearchData } from '@/api/api-search';
import { getSearchAllColumn, getSearchAllFiled } from '@/api/api-domain';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';
import { useSearchStore } from '@/stores/search';
import { useI18n } from 'vue-i18n';
import { getParamsRules } from '@/utils/common';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS, COUNT_PAGESIZE_FIELD } from '@/data/query';
import { os } from '@/data/filter/';

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

const pkgData = ref([]);
const tabName = ref('all');
const keywordType = ref((route.query.key as string) || '');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');
const nameOrder = ref('');

const searchOs = ref('');
const searchArch = ref('');
const searchCategory = ref<string[]>([]);
const searchParams = computed(() => {
  return {
    keyword: searchKey.value,
    keywordType: keywordType.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    dataType: tabName.value,
    os: searchOs.value,
    arch: searchArch.value,
    category: searchCategory.value.join(),
    nameOrder: nameOrder.value,
  };
});

const isSearchError = ref(false);
const isSearchDocs = ref(false);
// sql搜索
const queryAllpkg = () => {
  const params = {
    name: 'domain',
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    os: searchOs.value,
    arch: searchArch.value,
    category: searchCategory.value.join(),
    nameOrder: nameOrder.value,
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
    .catch((err) => {
      useViewStore().showNotFound();
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
    });
};

// es搜索
const querySearch = () => {
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      pkgData.value = res.data.all;
      total.value = res.data.total;
      if (searchStore.nameOrder) {
        searchStore.changeNameOrderCount(total.value);
      }
      isSearchDocs.value = true;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
      isLoading.value = false;
    })
    .catch(() => {
      isSearchError.value = true;
      total.value = 0;
      pkgData.value = [];
      isLoading.value = false;
      isSearchDocs.value = false;
      isSearchError.value = true;
    });
};

const arch = ['x86_64', 'aarch64', 'noarch', 'riscv64', 'loongarch64'];

// 获取筛选参数列表
const filterOsList = ref<string[]>([]);
const filterArchList = ref<string[]>([]);
const filterCategoryList = ref<string[]>([]);
const isFilterLoading = ref(false);

filterOsList.value = os;
filterArchList.value = arch;
const queryFilter = () => {
  filterCategoryList.value = [];
  isFilterLoading.value = true;
  getSearchAllColumn({
    name: 'domain',
    column: 'category',
  })
    .then((res) => {
      const { arch, category } = res.data;
      filterCategoryList.value = category;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const handleCloseTag = (type: string, idx?: string | number) => {
  if (type === 'category') {
    const numIdx = Number(idx);
    searchCategory.value.splice(numIdx, 1);
  } else if (type === 'os') {
    searchOs.value = '';
  } else if (type === 'arch') {
    searchArch.value = '';
  }
};

// 重置筛选结果
const isClear = ref(false);
const resetTag = () => {
  searchOs.value = '';
  searchArch.value = '';
  searchCategory.value = [];
  isSearchDocs.value = false;
  isClear.value = true;
  nameOrder.value = '';
  currentPage.value = 1;

  if (route.query.type || route.query.os || route.query.arch) {
    router.push({
      path: `/${locale.value}/field`,
    });
  }
};

// 更新时间、字母排序
const changeSortValue = (v: string[] | string) => {
  nameOrder.value = '';
  currentPage.value = 1;
  if (Array.isArray(v)) {
    if (v[0] === 'nameOrder') {
      nameOrder.value = v[1];
    }
  } else {
    isClear.value = false;
  }
};

// 清除input数据
const clearFilterInput = () => {
  searchKey.value = '';
};

// 分页
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === 'all') {
    isLoading.value = true;
    if (searchKey.value === '') {
      queryAllpkg();
    } else {
      querySearch();
    }
  }
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

// -------------------- 除分页器相关请求参数变化，发请求获取新数据 --------------------
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
  const { name, tab, key, os, arch, type } = query;

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
    tabName.value = TABNAME_OPTIONS[0];
  }
  // 判断key参数
  if (isValidSearchKey(key) && key) {
    keywordType.value = encodeURIComponent(key as string);
  } else {
    keywordType.value = FLITERMENUOPTIONS[0].id;
  }

  //判断主页领域应用更多跳转
  if (!isUndefined(type) && type) {
    searchCategory.value.push(type as string);
  }

  // 首页社区版本跳转
  if (!isUndefined(os) && os) {
    searchOs.value = os?.toString();
  }
  if (!isUndefined(arch) && arch) {
    searchArch.value = arch?.toString();
  }
};

watch(
  () => route.query,
  () => {
    handleQueryData();
  },
  { deep: true }
);

watch(
  () => pkgData.value,
  () => {
    if (pkgData.value.length > 0) {
      isSearchError.value = false;
    }
  }
);
</script>

<template>
  <div class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar">
      <template v-if="isFilterLoading"><FilterItemSkeleton v-for="tag in 3" :key="tag" /></template>
      <template v-else>
        <FilterRadio v-if="filterOsList.length" v-model="searchOs" :options="filterOsList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconOs /></OIcon>{{ t('software.filterSider.os') }}
            </div>
          </template>
        </FilterRadio>

        <FilterRadio v-if="filterArchList.length" v-model="searchArch" :options="filterArchList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconArch /></OIcon>{{ t('software.filterSider.arch') }}
            </div>
          </template>
        </FilterRadio>

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
      <FilterHeader :title="t('software.all')" :type="tabName" @sort="changeSortValue" :is-clear="isClear" :total="total" @clear="clearFilterInput" />

      <div v-if="isSearchDocs || searchOs || searchArch || searchCategory.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          <template v-if="isSearchDocs">
            为您找到<span class="total">{{ total }}</span
            >个与<span class="search-value">{{ searchKey }}</span
            >匹配的搜索结果</template
          >
          <template v-else>
            为您找到符合条件的筛选<span class="total">{{ total }}</span
            >个
          </template>
        </p>
        <div v-if="searchOs || searchArch || searchCategory.length > 0" class="search-filter-tags">
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OTag v-if="searchArch" closable @Close="handleCloseTag('arch')">{{ searchArch }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="handleCloseTag('category', index)">{{ item }}</OTag>
          <OLink color="primary" class="resetting" @click="resetTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <div class="pkg-content" :class="pkgData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" type="领域应用" />
        <div v-if="pkgData.length !== 0 && !isSearchError" class="pkg-panel">
          <ORow gap="32px" flex-wrap="wrap">
            <template v-if="pkgData.length > 0">
              <OCol v-for="(subItem, index) in pkgData" :key="index" flex="0 1 33.33%" :laptop="{ flex: '0 1 33.33%' }">
                <OCardItem :data="subItem" />
              </OCol>
            </template>
            <template v-else>
              <OCol v-for="index in 12" :key="index" flex="0 1 33.33%" :laptop="{ flex: '0 1 33.33%' }">
                <OCardItemSkeleton />
              </OCol>
            </template>
          </ORow>

          <div v-if="total > COUNT_PAGESIZE_FIELD[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
