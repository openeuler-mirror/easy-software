<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { OSelect, OOption, OInput, OIcon, vLoading, useMessage, isUndefined, ODivider } from '@opensig/opendesign';
import { useDebounceFn } from '@vueuse/core';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { useRouter, useRoute } from 'vue-router';
import { getSearchDataAll } from '@/api/api-search';
import type { RecommendItemT } from '@/@types/search';
import { onClickOutside } from '@vueuse/core';
import { useLocale } from '@/composables/useLocale';
import useSearchHistory from '@/composables/useSearchHistory';
import { useI18n } from 'vue-i18n';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';

import SearchRecommend from '@/components/search/SearchRecommend.vue';

import IconSearch from '~icons/app/icon-search.svg';
import { oaReport } from '@/shared/analytics';

defineProps({
  placeholder: {
    type: String,
    default: () => '',
  },
  show: {
    type: Boolean,
    default: () => true,
  },
  isHeader: {
    type: Boolean,
    default: () => false,
  },
});
const msg = useMessage();
const router = useRouter();
const route = useRoute();
const { locale } = useLocale();
const { t } = useI18n();

const defaultValue = ref('all');
const searchInput = ref('');
const tabName = ref('all');
const fliterSelected = ref(defaultValue.value);

const reportAnalytics = (data: Record<string, any>, event = 'click') => {
  oaReport(
    event,
    {
      module: isPageHome.value ? 'home_page' : 'search_page',
      ...data,
    },
    'search_software'
  );
};

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
  if (v.length > 100) {
    return msg.danger({
      content: '文字长度不能超过100字符',
    });
  }
  reportAnalytics({
    type: 'search',
    content: v,
  });
  isLoading.value = false;
  isFocus.value = false;
  searchInput.value = v;
  replaceWinUrl();
};

const searchHistory = useSearchHistory();
const replaceWinUrl = () => {
  searchHistory.add(searchInput.value);
  router.push({
    path: `/${locale.value}/search`,
    query: {
      name: searchInput.value,
      tab: tabName.value,
      key: defaultValue.value,
    },
  });
};

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
const changeSearchFocus = (state: boolean) => {
  isFocus.value = state;
  reportAnalytics({
    type: 'search_input',
  });
};

const changeSearchBlur = () => {
  const name = route.query.name as string;
  if (isPageSearch.value) {
    if (searchInput.value === '' || name !== searchInput.value) {
      searchInput.value = name;
    }
    return;
  }
  if (searchInput.value) {
    reportAnalytics(
      {
        content: searchInput.value,
      },
      'input'
    );
  }
};

onClickOutside(searchRef, () => {
  isFocus.value = false;
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
  };
  getSearchDataAll(params)
    .then((res) => {
      if (res.data.length) {
        recommendList.value = res.data;
      } else {
        isNoFound.value = true;
        recommendList.value = [];
      }
      isLoading.value = false;
    })
    .catch(() => {
      recommendList.value = [];
      isNoFound.value = true;
      isLoading.value = false;
    });
};

//搜索防抖
const debouncedFn = useDebounceFn(() => {
  queryDocsAll();
}, 350);

const trottleSearch = (v: string) => {
  if (v.length > 100) {
    return msg.danger({
      content: '文字长度不能超过100字符',
    });
  }
  isLoading.value = true;
  debouncedFn();
};

// 判断是否是搜索页
const isPageSearch = ref(false);
const isPageHome = ref(false);

onMounted(() => {
  isPageSearch.value = route.name === 'search';
  isPageHome.value = route.name === 'home';
});

// -------------------- 监听 url query 变化 触发搜索 ---------------------
const handleQueryData = () => {
  const query = route.query;
  const { name, tab, key } = query;

  if (!isUndefined(name) && name) {
    searchInput.value = decodeURIComponent(name as string);
  }
  // 判断key参数
  if (isValidSearchKey(key)) {
    defaultValue.value = key as string;
  } else {
    defaultValue.value = FLITERMENUOPTIONS[0].id;
  }

  if (isValidSearchTabName(tab)) {
    tabName.value = tab as string;
  } else {
    tabName.value = TABNAME_OPTIONS[0];
  }
};
handleQueryData();

watch(
  () => route.query,
  () => {
    handleQueryData();
    isPageHome.value = route.name === 'home';
  },
  { deep: true }
);
</script>

<template>
  <div ref="searchRef" class="search" :class="[show ? 'xl' : 'large', isFocus && 'is-expanded', isHeader && isPageHome && 'header-show']">
    <div class="search-panel">
      <div class="search-content">
        <OSelect
          v-model="defaultValue"
          :placeholder="FLITERMENUOPTIONS[0].name"
          variant="text"
          :size="show ? 'large' : 'medium'"
          round="0"
          @change="(v) => changeFilter(v)"
        >
          <OOption v-for="item in FLITERMENUOPTIONS" :key="item.id" :label="item.name" :value="item.id" />
        </OSelect>
        <ODivider direction="v" :darker="true" :style="{ '--o-divider-label-gap': 0 }" />

        <OInput
          v-model="searchInput"
          :placeholder="isHeader ? t('software.searchPlaceholder1') : t('software.searchPlaceholder')"
          variant="solid"
          round="0"
          clearable
          class="search-input"
          :max-length="100"
          @press-enter="(v) => changeSearchInput(v)"
          @input="trottleSearch"
          @clear="clearInput"
          @focus="changeSearchFocus(true)"
          @blur="changeSearchBlur"
        >
          <template #prefix>
            <OIcon class="search-icon"><IconSearch /></OIcon>
          </template>
        </OInput>
      </div>
      <div class="search-content-detail">
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
  </div>
</template>

<style lang="scss" scoped>
.search {
  --select-width: 120px;
  --search-height: 40px;
  :deep(.o-input) {
    @include text1;
  }
  &.xl {
    --search-height: 48px;
    :deep(.o-select) {
      height: var(--search-height);
    }
    :deep(.search-input) {
      height: var(--search-height);
    }
  }

  &.header-show {
    max-width: 512px;
    position: absolute;
    right: 0;
    transform: scaleX(1);
    transform-origin: right;
    z-index: 60;
    top: -32px;
    padding: 16px 0;
    transition: all var(--o-duration-m2) var(--o-easing-standard);

    --select-width: 94px;
    &.is-expanded {
      transform: scaleX(1);
      background: var(--o-color-fill2);
      border-radius: var(--o-radius-s);
      box-shadow: var(--o-shadow-2);
      padding: 16px;

      .search-detail {
        width: 100%;
        border-color: transparent;
      }
      .search-input {
        flex: 1;
      }
      .search-content {
        width: 480px;
        box-shadow: none;
      }
      .recommend {
        position: relative;
        top: 0;
        min-height: 32px;
      }
    }
    :deep(.o-input) {
      @include tip1;
    }
  }

  .search-panel {
    position: relative;
  }

  .search-content {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--o-color-control1);
    border-radius: 8px;

    background: var(--o-color-fill2);
    box-shadow: var(--o-shadow-1);

    transition: all var(--o-duration-m1) var(--o-easing-standard-in);
  }
  :deep(.o-layer.o-loading) {
    padding-top: 0;
  }

  .search-content-detail {
    padding-left: var(--select-width);
    .recommend {
      position: absolute;
      z-index: 99;
      top: calc(var(--search-height) + 4px);
      width: calc(100% - var(--select-width));
      background-color: var(--o-color-control-light);
      box-shadow: var(--o-shadow-2);
      height: auto;
      padding: 16px 16px 12px;
      border-radius: 4px;
      p {
        text-align: center;
        @include tip1;
        color: var(--o-color-info3);
      }
      &.o-layer-open {
        padding: 24px;
      }
      :deep(.o-loading) {
        .o-loading-main {
          padding: 0;
          justify-content: center;

          .o-loading-icon {
            font-size: 24px;
            margin-bottom: 0;
          }
          svg {
            width: 24px;
            height: 24px;
            margin-bottom: 0;
          }
        }
      }
    }
  }
  .search-icon {
    font-size: 24px;
  }
  :deep(.o-select) {
    width: var(--select-width);
  }

  :deep(.search-input) {
    width: 680px;
  }
}
:deep(.o-input-wrap) {
  background: none;
  border: 0 none;
  padding: 0 4px 0 12px;
  align-items: center;
}

.search-input {
  width: 100%;
}
.search-box {
  position: relative;
  flex: 1;
}
</style>
