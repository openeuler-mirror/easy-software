<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { ORow, OCol, OTag, vLoading, OLink, OIcon } from '@opensig/opendesign';
import { getSearchData } from '@/api/api-search';
import { getSearchAllColumn, getSearchAllFiled } from '@/api/api-domain';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { ElPagination } from 'element-plus';

import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconArch from '~icons/pkg/icon-arch.svg';
import IconCategory from '~icons/pkg/icon-category.svg';

const { locale } = useLocale();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const pkgData = ref([]);
const tabName = ref('all');
const keywordType = ref((route.query.key as string) || '');
const isLoading = ref(false);

const searchKey = ref((route.query.name as string) || '');
const timeOrder = ref('desc');
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
    timeOrder: timeOrder.value,
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
    timeOrder: timeOrder.value,
    nameOrder: nameOrder.value,
  };
  isLoading.value = true;
  getSearchAllFiled(params).then((res) => {
    pkgData.value = res.data.list;

    total.value = res.data.total;
    isLoading.value = false;
    if (pkgData.value.length === 0) {
      isSearchError.value = true;
    }
  });
};

// es搜索
const querySearch = () => {
  isLoading.value = true;
  getSearchData(searchParams.value)
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
  if (route.query.type) {
    router.push({
      path: `/${locale.value}/applicationsPackage`,
    });
  }
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

  //判断主页领域应用跳转
  const homeType = route.query.type as string;
  if (homeType) {
    searchCategory.value.push(homeType);
  } else {
    pageSearch();
  }
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
  () => [searchCategory.value, searchOs.value, searchArch.value, nameOrder.value, timeOrder.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

watch(
  () => route.query.name as string,
  (v: string) => {
    if (searchKey.value !== v && v !== undefined) {
      searchKey.value = v;
    }
    if (v === '') {
      isSearchDocs.value = false;
    }
    currentPage.value = 1;
  }
);

watch(
  () => route.query.tab as string,
  (v: string) => {
    tabName.value = v;
  }
);

watch(
  () => route.query.key as string,
  (v: string) => {
    keywordType.value = v;
  }
);
</script>

<template>
  <div class="pkg-wrap" :class="tabName">
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
      <FilterHeader :title="t('software.all')" @sort="changeTimeOrder" :isSort="false" :total="total" />

      <div v-if="isSearchDocs || searchOs || searchArch || searchCategory.length > 0" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
        </p>
        <div v-if="searchOs || searchArch || searchCategory.length > 0" class="search-filter-tags">
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OTag v-if="searchArch" closable @Close="handleCloseTag('arch')">{{ searchArch }}</OTag>
          <OTag v-for="(item, index) in searchCategory" :key="item" closable @Close="handleCloseTag('category', index)">{{ item }}</OTag>
          <OLink color="primary" class="resetting" @click="onResetTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <ResultNotFound v-if="pkgData.length === 0 && isSearchError" />
      <template v-else>
        <div v-loading.nomask="isLoading" class="pkg-panel">
          <ORow gap="32px" flex-wrap="wrap">
            <OCol v-for="(subItem, index) in pkgData" :key="index" flex="0 1 33.33%" :laptop="{ flex: '0 1 33.33%' }">
              <OCardItem :data="subItem" />
            </OCol>
          </ORow>
        </div>
        <div class="pagination-box">
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
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/content/index.scss';
</style>
