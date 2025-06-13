<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSearchCount } from '@/api/api-search';
import { isUndefined } from '@opensig/opendesign';
import type { MenuCountT } from '@/@types/search';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { PACKAGE_TYPE_MAPPING, FLITERMENUOPTIONS } from '@/data/query';

import SearchTab from '@/components/search/SearchTab.vue';
import AppPkgContent from '@/views/field/FieldContent.vue';
import EpkgContent from '@/views/epkg/EpkgContent.vue';
import OepkgContent from '@/views/oepkg/OEpkgContent.vue';
import ImageContent from '@/views/image/ImageContent.vue';
import RpmContent from '@/views/package/RpmContent.vue';
import CondaContent from '@/views/conda/CondaContent.vue';
import UpstreamContent from '@/views/upstream/UpstreamContent.vue';

const route = useRoute();
const router = useRouter();

const tabName = ref('');
const menuData = ref<MenuCountT[]>([]);
const searchKey = ref('');
const keywordType = ref('');

// -------------------- 搜索类型结果数量 ---------------------
const querySearchCount = () => {
  const searchParams = {
    keyword: searchKey.value,
    keywordType: keywordType.value,
  };
  getSearchCount(searchParams)
    .then((res) => {
      if (res.code === 200) {
        // 格式化参数 名称保持一致
        menuData.value = res.data.map((item) => ({
          ...item,
          key: PACKAGE_TYPE_MAPPING[item.key as keyof typeof PACKAGE_TYPE_MAPPING] || item.key,
        }));
      }
    })
    .catch(() => {
      menuData.value = [];
    });
};

// -------------------- 监听 url query 变化 触发搜索 ---------------------
const handleQueryData = () => {
  const query = route.query;
  const { q, sort, type } = query;

  if (!isUndefined(q) && q) {
    searchKey.value = q;
  }

  // 判断key参数
  keywordType.value = isValidSearchKey(sort) ? sort : FLITERMENUOPTIONS[0].id;

  if (isValidSearchTabName(type) && type) {
    tabName.value = type;
  } else {
    tabName.value = PACKAGE_TYPE_MAPPING['all'];
  }

  querySearchCount();
};

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.name && !newQuery.q) {
      router.replace({
        path: route.path,
        query: {
          q: newQuery.name,
          type: newQuery.tab ?? newQuery.type,
          sort: newQuery.key ?? newQuery.sort,
        },
      });
    }
    if (newQuery.q) {
      handleQueryData();
    }
  },
  { immediate: true }
);

// 组件映射
const tabComponent = {
  [PACKAGE_TYPE_MAPPING['all']]: AppPkgContent,
  [PACKAGE_TYPE_MAPPING['conda']]: CondaContent,
  [PACKAGE_TYPE_MAPPING['epkg']]: EpkgContent,
  [PACKAGE_TYPE_MAPPING['oepkg']]: OepkgContent,
  [PACKAGE_TYPE_MAPPING['image']]: ImageContent,
  [PACKAGE_TYPE_MAPPING['rpm']]: RpmContent,
  [PACKAGE_TYPE_MAPPING['appversion']]: UpstreamContent,
};
</script>

<template>
  <div class="layout">
    <div class="home-header">
      <SearchFilter :show="false" />
      <SearchTab :menu="menuData" />
    </div>
  </div>
  <ContentWrapper vertical-padding="40px">
    <div class="tab">
      <component v-if="tabName && tabComponent[tabName]" :is="tabComponent[tabName]" />
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.layout {
  background: var(--o-color-primary1) url(@/assets/banner/search-banner.jpg) no-repeat top center/cover;
  .home-header {
    padding: 32px 0 0 308px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 140px;
    max-width: var(--layout-content-max-width);
    margin: 0 auto;
    .search {
      width: 800px;
    }
    :deep(.o-select) {
      height: 40px;
    }
    :deep(.search-input) {
      height: 40px;
    }
  }

  :deep(.o-tab) {
    --tab-nav-anchor-color: #fff;
    min-width: 800px;
    .o-tab-nav {
      line-height: 52px;
      --tab-nav-padding: 0;
      color: #fff;
      opacity: 0.8;
    }
    .o-tab-nav-active {
      opacity: 1;
    }
  }
}
</style>
