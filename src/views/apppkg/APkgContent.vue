<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { ORow, OCol, OTag, vLoading, OLink, OIcon, isUndefined, isString } from '@opensig/opendesign';
import { getSearchData } from '@/api/api-search';
import { getSearchAllColumn, getSearchAllFiled } from '@/api/api-domain';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/common';
import { useI18n } from 'vue-i18n';
import { getParamsRules } from '@/utils/common';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';

import { ElPagination, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const { locale, isZh } = useLocale();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

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
      useViewStore().showNotFound();
    });
};

// es搜索
const querySearch = () => {
  isLoading.value = true;
  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      pkgData.value = res.data.all;
      total.value = res.data.total;
      isSearchDocs.value = true;
      if (pkgData.value.length === 0) {
        isSearchError.value = true;
      }
      isLoading.value = false;
    })
    .catch(() => {
      pkgData.value = [];
      isLoading.value = false;
      isSearchDocs.value = false;
      isSearchError.value = true;
      useViewStore().showNotFound();
    });
};

// 获取筛选参数列表
const filterOsList = ref('');
const filterArchList = ref('');
const filterCategoryList = ref<string[]>([]);
const isFilterLoading = ref(false);

const queryFilter = () => {
  filterOsList.value = '';
  filterArchList.value = '';
  isFilterLoading.value = true;
  getSearchAllColumn({
    name: 'domain',
    column: 'os,arch,category',
  })
    .then((res) => {
      const { os, arch, category } = res.data;
      filterOsList.value = os;
      filterCategoryList.value = category;
      filterArchList.value = arch;
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
const onResetTag = () => {
  searchOs.value = '';
  searchArch.value = '';
  searchCategory.value = [];
  isSearchDocs.value = false;
  nameOrder.value = '';
  if (route.query.type) {
    router.push({
      path: `/${locale.value}/apppkg`,
    });
  }
};

// 更新时间、字母排序
const changeTimeOrder = (v: string[]) => {
  if (v[0] === 'nameOrder') {
    nameOrder.value = v[1];
  }
  currentPage.value = 1;
};

// 分页
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const pageSizes = [12, 24, 48, 96];
const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === 'all') {
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

  //判断主页领域应用跳转
  const homeType = route.query.type as string;
  if (isString(homeType) && homeType) {
    searchCategory.value.push(homeType);
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
    tabName.value = TABNAME_OPTIONS[0];
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
    <div class="filter-sidebar">
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
    </div>
    <div class="pkg-content">
      <FilterHeader v-if="pkgData.length > 0 || isSearchError" :title="t('software.all')" @sort="changeTimeOrder" :isSort="false" :total="total" />

      <div v-if="isSearchDocs || searchOs || searchArch || searchCategory.length > 0" class="search-result">
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
        <div v-if="searchOs || searchArch || searchCategory.length > 0" class="search-filter-tags">
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OTag v-if="searchArch" closable @Close="handleCloseTag('arch')">{{ searchArch }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="handleCloseTag('category', index)">{{ item }}</OTag>
          <OLink color="primary" class="resetting" @click="onResetTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <ResultNotApp v-if="pkgData.length === 0 && isSearchError" />
      <template v-else>
        <div class="pkg-panel">
          <ORow gap="32px" flex-wrap="wrap">
            <OCol v-for="(subItem, index) in pkgData" :key="index" flex="0 1 33.33%" :laptop="{ flex: '0 1 33.33%' }">
              <OCardItem :data="subItem" />
            </OCol>
          </ORow>
        </div>
        <div v-if="pkgData.length > 0" class="pagination-box">
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
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
