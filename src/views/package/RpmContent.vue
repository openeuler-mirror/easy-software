<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, vLoading, OLink, OIcon, isUndefined, isString } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { getSearchData } from '@/api/api-search';
import { useRoute } from 'vue-router';
import { getSearchAllFiled } from '@/api/api-domain';
import { useLocale } from '@/composables/useLocale';

import { getParamsRules } from '@/utils/common';
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

const columns = [
  { label: t('software.columns.name'), key: 'name', style: 'width:15%' },
  { label: t('software.columns.version'), key: 'version' },
  { label: t('software.columns.os'), key: 'os' },
  { label: t('software.columns.arch'), key: 'arch' },
  { label: t('software.columns.category'), key: 'category', style: 'width:8%' },
  { label: t('software.columns.timeorder'), key: 'rpmUpdateAt' },
  { label: t('software.columns.size'), key: 'rpmSize', style: 'width:11%' },
  { label: t('software.columns.operation'), key: 'operation', style: 'width:14%' },
];

//  ------------  main ------------
const pkgData = ref([]);

const tabName = ref('rpmpkg');
const keywordType = ref((route.query.key as string) || '');
const isLoading = ref(false);
const timeOrder = ref('');
const nameOrder = ref('');

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
  isLoading.value = true;

  // 过滤空参数
  const newData = getParamsRules(searchParams.value);
  getSearchData(newData)
    .then((res) => {
      pkgData.value = res.data.rpmpkg;
      total.value = res.data.total;
      isLoading.value = false;
      isSearchDocs.value = true;
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
  if (tabName.value === 'rpmpkg') {
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

const rpmColumn = {
  os: [
    'openEuler-23.09',
    'openEuler-23.03',
    'openEuler-22.09',
    'openEuler-22.03-LTS-SP3',
    'openEuler-22.03-LTS-SP2',
    'openEuler-22.03-LTS-SP1',
    'openEuler-22.03-LTS',
    'openEuler-21.09',
    'openEuler-21.03',
    'openEuler-20.09',
    'openEuler-20.03-LTS-SP4',
    'openEuler-20.03-LTS-SP3',
    'openEuler-20.03-LTS-SP2',
    'openEuler-20.03-LTS-SP1',
    'openEuler-20.03-LTS',
    'openEuler-preview',
  ],
  arch: ['aarch64', 'noarch', 'x86_64', 'loongarch64', 'riscv64', 'sw_64'],
  category: ['AI', 'HPC', '云服务', '分布式存储', '大数据', '其他'],
};

const queryFilter = () => {
  filterOsList.value = [];
  filterArchList.value = [];
  filterCategoryList.value = [];

  filterOsList.value = rpmColumn.os;
  filterArchList.value = rpmColumn.arch;
  filterCategoryList.value = rpmColumn.category;
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
  timeOrder.value = '';
  nameOrder.value = '';
  isSearchDocs.value = false;
};

// 更新时间、字母排序
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
  pageSearch();
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
    isSearchDocs.value = false;
  }
  if (isString(tab) && tab) {
    tabName.value = tab?.toString();
  }
  if (isString(key) && key) {
    keywordType.value = key?.toString();
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

    <div class="pkg-content">
      <FilterHeader title="RPM" @sort="changeTimeOrder" :total="total" />
      <div v-if="isSearch || searchArch.length > 0 || searchOs.length > 0 || searchCategory.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
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
