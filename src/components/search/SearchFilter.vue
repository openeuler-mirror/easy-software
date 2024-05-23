<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { OSelect, OOption, OInput, OIcon, vLoading } from '@opensig/opendesign';
import { useRouter, useRoute } from 'vue-router';
import { getSearchDataAll } from '@/api/api-search';
import type { RecommendItemT } from '@/@types/search';
import { onClickOutside } from '@vueuse/core';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';

import SearchRecommend from '@/components/search/SearchRecommend.vue';

import IconSearch from '~icons/app/icon-search.svg';

defineProps({
  placeholder: {
    type: String,
    default: () => '',
  },
  show: {
    type: Boolean,
    default: () => true,
  },
});

const router = useRouter();
const route = useRoute();
const { locale } = useLocale();
const { t } = useI18n();

// 筛选菜单
const flitermenuItem = [
  {
    id: 'all',
    name: t('software.filterAll'),
  },
  {
    id: 'name',
    name: t('software.filterName'),
  },
  {
    id: 'summary',
    name: t('software.filterSummary'),
  },
  {
    id: 'file',
    name: t('software.filterFile'),
  },
];

const defaultValue = ref('all');
const searchInput = ref('');
const tabName = ref('all');
const fliterSelected = ref(defaultValue.value);
const changeFilter = (v: string) => {
  fliterSelected.value = v;
  if (searchInput.value !== '') {
    replaceWinUrl();
  }
};

// 搜索框事件
const changeSearchInput = (v: string) => {
  if (v === '') {
    return;
  }
  isLoading.value = true;
  isFocus.value = false;
  searchInput.value = v;
  replaceWinUrl();
};

const replaceWinUrl = () => {
  searchRecommendRef.value?.getSearchHistory(searchInput.value);

  router.push({
    path: `/${locale.value}/search`,
    query: {
      name: searchInput.value,
      tab: tabName.value,
      key: fliterSelected.value,
    },
  });
};

// 监听搜索关键字
watch(
  () => route.query.name as string,
  (v: string) => {
    if (v !== '') {
      searchInput.value = v;
    }
  }
);

watch(
  () => route.query?.tab as string,
  (v) => {
    tabName.value = v;
  }
);

// ----------------- 联想搜索 -------------------------
const searchRef = ref();

const clearInput = () => {
  isFocus.value = false;
  isNoFound.value = false;
  isLoading.value = false;
};

const searchRecommendRef = ref();
const clickRecommend = (v: string) => {
  searchInput.value = v;
  queryDocsAll();
};

const isFocus = ref(false);
const changeFocusState = (state: boolean) => {
  isFocus.value = state;
};

const init = () => {
  isFocus.value = false;
  clearTimeout(timer);
};

onClickOutside(searchRef, () => {
  init();
});

const recommendList = ref<RecommendItemT[]>([]);
const isNoFound = ref(false);
const isLoading = ref(false);
const queryDocsAll = () => {
  isLoading.value = true;
  const params = {
    keyword: searchInput.value,
    pageNum: 1,
    pageSize: 3,
    dataType: '',
  };
  getSearchDataAll(params).then((res) => {
    try {
      if (res.data.length) {
        recommendList.value = res.data;
      } else {
        isNoFound.value = true;
        recommendList.value = [];
      }
      isLoading.value = false;
    } catch {
      isNoFound.value = true;
      isLoading.value = false;
    }
  });
};

let timer: any;
const trottleSearch = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    queryDocsAll();
  }, 500);
};

onMounted(() => {
  defaultValue.value = route.query.key as string;
  isLoading.value = false;

  if (route.query.name) {
    searchInput.value = decodeURIComponent(route.query.name as string);
  }
});
</script>

<template>
  <div ref="searchRef" class="search" :class="show ? 'xl' : 'large'">
    <OSelect
      v-model="defaultValue"
      style="width: 120px"
      :placeholder="flitermenuItem[0].name"
      variant="text"
      :size="show ? 'large' : 'medium'"
      round="0"
      @change="(v) => changeFilter(v)"
    >
      <OOption v-for="item in flitermenuItem" :key="item.id" :label="item.name" :value="item.id" />
    </OSelect>
    <div class="search-box">
      <OInput
        v-model="searchInput"
        :placeholder="t('software.searchPlaceholder')"
        variant="solid"
        round="0"
        clearable
        class="search-input"
        @press-enter="(v) => changeSearchInput(v)"
        @input="trottleSearch"
        @clear="clearInput"
        @focus="changeFocusState(true)"
      >
        <template #prefix>
          <OIcon class="search-icon"><IconSearch /></OIcon>
        </template>
      </OInput>
      <div v-if="isLoading" v-loading.nomask="isLoading" class="recommend"></div>
      <SearchRecommend
        v-else
        ref="searchRecommendRef"
        v-show="isFocus"
        :options="recommendList"
        :search-value="searchInput"
        :filter-value="fliterSelected"
        :isFeedback="isNoFound"
        @click-recommend="clickRecommend"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recommend {
  position: absolute;
  z-index: 99;
  top: 60px;
  width: 100%;
  background-color: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
  height: auto;
  padding: 24px;
  p {
    text-align: center;
    @include tip1;
    color: var(--o-color-info3);
  }
}
.search {
  display: flex;
  justify-content: center;
  background: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
  border-radius: var(--layout-pkg-radius);
  transition: all var(--o-duration-m1) var(--o-easing-standard-in);
  .search-icon {
    font-size: 24px;
  }
  &.xl {
    :deep(.o-select) {
      height: 48px;
    }
    :deep(.search-input) {
      height: 48px;
    }
  }
  &.large {
    :deep(.o-input) {
      @include text1;
    }
  }

  :deep(.search-input) {
    width: 680px;
  }
}
:deep(.o-input-wrap) {
  background: none;
  border: 0 none;
}

.search-input {
  width: 100%;
}
.search-box {
  position: relative;
  width: 100%;
}
</style>
