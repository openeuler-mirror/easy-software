<script lang="ts" setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import { OTag, OLink, OIcon, OTable } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getParamsRules, checkOriginLink, windowOpen } from '@/utils/common';

import { getUpstreamColumn, getUpstream } from '@/api/api-upstream';
import { useViewStore } from '@/stores/common';
import { COUNT_PAGESIZE, SORTPARAMS } from '@/data/query';

import FilterRadio from '@/components/filter/FilterRadio.vue';
import AppLoading from '@/components/AppLoading.vue';
import IconOs from '~icons/pkg/icon-os.svg';
import IconAppType from '~icons/pkg/icon-app-type.svg';
import IconStatus from '~icons/pkg/icon-status.svg';
import FilterCheckbox from '@/components/filter/FilterCheckbox.vue';
import ExternalLink from '@/components/ExternalLink.vue';

const route = useRoute();
const { t } = useI18n();

// 软件包-表头
const columns = [
  { label: t('upstream.name'), key: 'name', style: 'width:18%', type: 'name' },
  { label: t('upstream.version'), key: 'upstreamVersion', style: 'width:15%', type: 'upstreamVersion' },
  { label: t('upstream.compatibility'), key: 'openeulerVersion', style: 'width:15%', type: 'openeulerVersion' },
  { label: t('upstream.eulerOsVersion'), key: 'eulerOsVersion', style: 'width:18%', type: 'eulerOsVersion' },
  { label: t('upstream.type'), key: 'type', style: 'width:10%', type: 'type' },
  { label: t('upstream.state'), key: 'status', style: 'width:6%', type: 'status' },
];

//  ------------  main ------------

const appData = ref([]);

const tabName = ref('appversion');
const nameOrder = ref('');
const isLoading = ref(false);

const searchKey = ref('');
const searchOs = ref('');
const searchType = ref('');
const searchStatus = ref<string[]>([]);

// 提取逻辑到单独的函数
const processItem = (item): any[] => {
  if (item?.applicationVersions?.length !== 1) {
    return item.applicationVersions.map((sub) => ({
      ...item,
      ...sub,
    }));
  }
  return [
    {
      ...item,
      ...item.applicationVersions[0],
    },
  ];
};

const queryAppVersion = () => {
  const params = {
    name: searchKey.value,
    eulerOsVersion: searchOs.value,
    type: searchType.value,
    status: searchStatus.value.join(),
    pageNum: currentPage.value,
    nameOrder: nameOrder.value,
    pageSize: pageSize.value,
  };
  // 过滤空参数
  const newData = getParamsRules(params);

  appData.value = [];

  getUpstream(newData)
    .then((res) => {
      total.value = res.data.total;
      isLoading.value = false;
      if (res.data.list.length === 0) {
        isSearchError.value = true;
      }
      nextTick(() => {
        appData.value = res.data.list.flatMap(processItem);

        calculateSpanInfo();
      });
    })
    .catch(() => {
      appData.value = [];
      isLoading.value = false;
      useViewStore().showNotFound();
    });
};

// es搜索
const isSearchError = ref(false);
const isSearch = ref(false);

// ----------- 左侧菜单交互-------------
// 获取筛选参数列表
const filterOsList = ref<string[]>([]);
const appTypeList = ref<{ label: string; value: string }[]>([]);
const statusList = ref<string[]>([]);
const isFilterLoading = ref(false);
const appTypeListDisplayNames: Record<string, string> = {
  rpm: 'RPM',
  image: '应用镜像',
  CONDA: 'CONDA',
};
const queryFilter = () => {
  filterOsList.value = [];
  isFilterLoading.value = true;
  getUpstreamColumn('eulerOsVersion,type,status')
    .then((res) => {
      filterOsList.value = res.data.eulerOsVersion;
      appTypeList.value = res.data.type.map((item: string) => ({ label: appTypeListDisplayNames[item], value: item }));

      statusList.value = res.data.status;
      isFilterLoading.value = false;
    })
    .catch(() => {
      isFilterLoading.value = false;
    });
};

const showSearchFilterTags = computed(() => searchType.value || searchStatus.value.length || searchOs.value);

const handleCloseTag = (type: string, index?: number) => {
  if (type === 'os') {
    searchOs.value = '';
  } else if (type === 'type') {
    searchType.value = '';
  } else if (type === 'category') {
    searchStatus.value.splice(Number(index), 1);
  }
};

// 重置筛选结果
const handleResettingTag = () => {
  searchOs.value = '';
  searchStatus.value = [];
  searchType.value = '';
  nameOrder.value = '';
  isSearch.value = false;
};

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  pageSearch();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  pageSearch();
};

// 判断是否是搜索页
const isPageSearch = ref(false);

onMounted(() => {
  searchKey.value = route.query?.name ?? route.query?.q ?? '';

  isPageSearch.value = route.name === 'search';

  pageSearch();
  queryFilter();
});

// 判断是走es还是sql
const pageSearch = () => {
  isSearchError.value = false;
  if (tabName.value === 'appversion') {
    isLoading.value = true;
    queryAppVersion();
  }
};

// 排序
const nameIndex = ref(0);
const changeSortBy = (v: string) => {
  const updateIndex = (index) => {
    if (index.value >= 2) {
      index.value = 0;
    } else {
      index.value++;
    }
  };

  nameOrder.value = '';
  if (v === 'name') {
    updateIndex(nameIndex);
    nameOrder.value = SORTPARAMS[nameIndex.value];
  }

  currentPage.value = 1;
};

watch(
  () => [searchOs.value, nameOrder.value, searchType.value, searchStatus.value],
  () => {
    currentPage.value = 1;
    pageSearch();
  }
);

watch(
  () => (route.query?.name as string) || (route.query?.q as string),
  (v: string) => {
    if (searchKey.value !== v && v !== undefined) {
      searchKey.value = v;
    }
    if (v === '') {
      searchKey.value = '';
      isSearch.value = false;
    }
    currentPage.value = 1;
    pageSearch();
  }
);

const changeFilterSearch = (v: string) => {
  searchKey.value = v;
};

const clearFilterSearch = () => {
  searchKey.value = '';
};

// ----------- 合并单元格-------------
// 记录已经处理过的值
const recordRowKey = new Map();
// 需要合并的列
const spanRow = ['name', 'upstreamVersion'];

// 提前计算合并信息
const calculateSpanInfo = () => {
  recordRowKey.clear();
  appData.value.forEach((row, index) => {
    const len = row.applicationVersions.length;
    if (len > 1) {
      const current = `${row.name.toLocaleLowerCase()}-${row.upstreamVersion}`;
      if (!recordRowKey.has(current)) {
        recordRowKey.set(current, index);
      }
    }
  });
};

//版本支持情况合并单元格
const cellSpanFn = (rowIndex: number, colIdx: number, row: any, column: any) => {
  const key = column.key;
  const len = row.applicationVersions.length;
  if (spanRow.includes(key) && len > 1) {
    const current = `${row.name.toLocaleLowerCase()}-${row.upstreamVersion}`;
    const startIndex = recordRowKey.get(current);

    if (startIndex === rowIndex) {
      return { rowspan: len, colspan: 1 };
    } else {
      return { rowspan: 0, colspan: 0 };
    }
  } else {
    return { rowspan: 1, colspan: 1 };
  }
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  if (checkOriginLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};

const joinUrl = (item) => {
  return `/zh/${item.type.toLocaleLowerCase()}/detail?pkgId=${item.pkgId}`;
};
</script>

<template>
  <div class="pkg-wrap" :class="tabName">
    <div class="filter-sidebar">
      <template v-if="isFilterLoading"><FilterItemSkeleton /></template>
      <template v-else>
        <FilterRadio v-if="appTypeList.length" v-model="searchType" :options="appTypeList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconAppType /></OIcon>应用类型
            </div>
          </template>
        </FilterRadio>
        <FilterRadio v-if="filterOsList.length" v-model="searchOs" :options="filterOsList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconOs /></OIcon>{{ t('software.filterSider.os') }}
            </div>
          </template>
        </FilterRadio>
        <FilterCheckbox v-if="statusList.length" v-model="searchStatus" :options="statusList">
          <template #header>
            <div class="filter-title">
              <OIcon><IconStatus /></OIcon>状态
            </div>
          </template>
        </FilterCheckbox>
      </template>
    </div>
    <div class="pkg-main">
      <FilterHeader title="APPVERSION" :total="total" @search="changeFilterSearch" @clear="clearFilterSearch" />
      <div v-if="searchOs || isSearch || showSearchFilterTags" class="search-result">
        <p v-if="!isPageSearch" class="text">
          为您找到符合条件的筛选<span class="total">{{ total }}</span
          >个
        </p>
        <div v-if="showSearchFilterTags" class="search-filter-tags">
          <OTag v-for="(item, index) in searchStatus" :key="item" closable @Close="handleCloseTag('category', index)">{{ item }}</OTag>
          <OTag v-if="searchType" closable @Close="handleCloseTag('type')">{{ searchType === '其他' ? '其他' : appTypeListDisplayNames[searchType] }}</OTag>
          <OTag v-if="searchOs" closable @Close="handleCloseTag('os')">{{ searchOs }}</OTag>
          <OLink color="primary" class="resetting" @click="handleResettingTag">{{ t('software.filterSider.clear') }}</OLink>
        </div>
      </div>
      <div class="pkg-content" :class="appData.length === 0 && isLoading ? 'loading' : ''">
        <AppLoading :loading="isLoading" />
        <ResultNoApp v-if="isSearchError" :type="t('upstream.title')" />
        <div v-if="appData.length !== 0 && !isSearchError" class="pkg-panel">
          <OTable :cell-span="cellSpanFn" :columns="columns" :data="appData" :small="true" border="all" :class="tabName">
            <template #header="{ columns }">
              <th v-for="item in columns" :key="item.type" :class="item.type">
                <div v-if="item.key === 'name'" @click="changeSortBy('name')" class="thead-th sort">
                  {{ item.label }}
                  <span class="sort-icon" :class="SORTPARAMS[nameIndex]"></span>
                </div>
                <div v-else class="thead-th">{{ item.label }}</div>
              </th>
            </template>
            <template #td_name="{ row }">
              <span v-dompurify-html="row.name"></span>
            </template>
            <template #td_type="{ row }">
              <OTag v-if="row.type" class="type">{{ appTypeListDisplayNames[row.type] }}</OTag>
              <template v-else>-</template>
            </template>

            <template #td_upstreamVersion="{ row }">
              <OLink v-if="row.upHomepage" @click="onExternalDialog(row.upHomepage)" color="primary">{{ row.upstreamVersion }}</OLink>
              <template v-else-if="row.upstreamVersion">{{ row.upstreamVersion }}</template>
              <template v-else>-</template>
            </template>
            <template #td_openeulerVersion="{ row }">
              <OLink v-if="row.pkgId" target="_blank" :href="joinUrl(row)" color="primary">{{ row.openeulerVersion }}</OLink>
              <template v-else-if="row.openeulerVersion">{{ row.openeulerVersion }}</template>
              <template v-else>-</template>
            </template>

            <template #td_status="{ row }">
              <OTag v-if="row.status" class="app-tag" :class="row.status.toLocaleLowerCase()">{{ row.status }} </OTag>
              <template v-else>-</template>
            </template>
          </OTable>

          <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>

          <!-- 跳转外部链接提示 -->
          <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/content/index.scss';

.type {
  --tag-bg-color: var(--o-color-fill1);
  --tag-bd-color: var(--o-color-fill1);
}
.app-tag {
  min-width: 92px;
  color: var(--o-color-white);
  &.outdated {
    --tag-bg-color: #058ef0;
    --tag-bd-color: #058ef0;
  }
  &.ok {
    --tag-bg-color: #0bb151;
    --tag-bd-color: #0bb151;
  }
  &.missing {
    --tag-bg-color: #c7000b;
    --tag-bd-color: #c7000b;
  }
}

:deep(.o-table) {
  --table-row-hover: transparent;

  .thead-th {
    display: flex;
    align-items: center;
    &.sort {
      cursor: pointer;
    }
  }
}
</style>
