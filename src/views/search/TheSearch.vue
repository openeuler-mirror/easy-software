<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSearchCount } from '@/api/api-search';

import type { MenuCountT } from '@/@types/search';

import SearchTab from '@/components/search/SearchTab.vue';
import AppPkgContent from '@/views/apppkg/APkgContent.vue';
import EpkgContent from '@/views/epkg/EpkgContent.vue';
import ImageContent from '@/views/image/ImageContent.vue';
import RpmContent from '@/views/package/RpmContent.vue';
import UpstreamContent from '@/views/upstream/UpstreamContent.vue';

const route = useRoute();

const DATATYPE = ['all', 'rpmpkg', 'apppkg', 'epkgpkg', 'appversion'];

const tabName = ref('');
const menuData = ref<MenuCountT[]>([]);
const searchKey = ref('');
const keywordType = ref('');

// 搜索类型结果数量
const querySearchCount = () => {
  const searchParams = {
    keyword: searchKey.value,
    keywordType: keywordType.value,
  };
  getSearchCount(searchParams).then((res) => {
    if (res.code === 200) {
      menuData.value = res.data;
    }
  });
};

onMounted(() => {
  tabName.value = route.query?.tab as string;
  searchKey.value = route.query?.name as string;
  keywordType.value = route.query?.key as string;
  querySearchCount();
});

// ---------------- 表格筛选值 ------------------

watch(
  () => route.query?.tab as string,
  (v) => {
    tabName.value = v;
  }
);
watch(
  () => route.query?.name as string,
  (v) => {
    searchKey.value = v;
    querySearchCount();
  }
);

watch(
  () => route.query?.key as string,
  (v) => {
    keywordType.value = v;
    querySearchCount();
  }
);
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
      <!-- 领域应用 -->
      <AppPkgContent v-if="tabName === DATATYPE[0]" />
      <!-- 软件包 -->
      <RpmContent v-if="tabName === DATATYPE[1]" />
      <!-- 容器镜像  -->
      <ImageContent v-if="tabName === DATATYPE[2]" />
      <!-- EPKG -->
      <EpkgContent v-if="tabName === DATATYPE[3]" />
      <!-- 上游兼容应用全景 -->
      <UpstreamContent v-if="tabName === DATATYPE[4]" />
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.layout {
  background: var(--o-color-primary1) url(@/assets/banner/search-banner.jpg) no-repeat top center/cover;
  .home-header {
    padding: 32px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 140px;
    :deep(.o-select) {
      height: 40px;
    }
    :deep(.search-input) {
      height: 40px;
    }
  }

  :deep(.o-tab) {
    --tab-nav-anchor-color: #fff;
    width: 800px;
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
