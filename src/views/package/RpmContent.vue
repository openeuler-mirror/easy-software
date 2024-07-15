<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { OTag, OLink, OIcon, isUndefined } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { getSearchData } from '@/api/api-search';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { getSearchAllFiled } from '@/api/api-domain';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';
import { getParamsRules } from '@/utils/common';
import { useViewStore } from '@/stores/common';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import AppLoading from '@/components/AppLoading.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const { locale } = useLocale();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const columns = [
  { label: t('software.columns.name'), key: 'name' },
  { label: t('software.columns.version'), key: 'version' },
  { label: t('software.columns.os'), key: 'os' },
  { label: t('software.columns.arch'), key: 'arch' },
  { label: t('software.columns.category'), key: 'category' },
  { label: t('software.columns.timeorder'), key: 'rpmUpdateAt' },
  { label: t('software.columns.size'), key: 'rpmSize' },
  { label: t('software.columns.operation'), key: 'operation' },
];

//  ------------  main ------------
const pkgData = ref([]);

const tabName = ref(TABNAME_OPTIONS[1]);
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
  if (tabName.value === TABNAME_OPTIONS[1]) {
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

const rpmColumn = {
  os: [
    'openEuler-24.03-LTS',
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
  currentPage.value = 1;

  if (route.query.os || route.query.arch) {
    router.push({
      path: `/${locale.value}/rpm`,
    });
  }
};

// 更新时间、字母排序
const changeTimeOrder = (v: string[]) => {
  nameOrder.value = '';
  timeOrder.value = '';
  if (v[0] === 'timeOrder') {
    timeOrder.value = v[1];
  } else if (v[0] === 'nameOrder') {
    nameOrder.value = v[1];
  }
  currentPage.value = 1;
};

// 清除排序
const clearFilter = () => {
  nameOrder.value = '';
  timeOrder.value = '';
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
  const { name, tab, key, os, arch } = query;
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
    tabName.value = TABNAME_OPTIONS[1];
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
      <FilterHeader title="RPM" @sort="changeTimeOrder" :total="total" @clear="clearFilter" />
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
      <div class="pkg-content">
        <AppLoading :loading="isLoading" />
        <ResultNotApp v-if="isSearchError" type="RPM" />
        <div v-if="pkgData.length !== 0 && !isSearchError" class="pkg-panel">
          <OTableItemNew :data="pkgData" :columns="columns" :type="tabName" />

          <div v-if="pkgData.length < total" class="pagination-box">
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
