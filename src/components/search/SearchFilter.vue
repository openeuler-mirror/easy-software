<script lang="ts" setup>
import { ref, watch } from 'vue';
import { OSelect, OOption, OInput, OIcon, vLoading, useMessage, isUndefined } from '@opensig/opendesign';
import { useDebounceFn } from '@vueuse/core';
import { isValidSearchTabName, isValidSearchKey } from '@/utils/query';
import { useRouter, useRoute } from 'vue-router';
import { getSearchDataAll } from '@/api/api-search';
import type { RecommendItemT } from '@/@types/search';
import { onClickOutside } from '@vueuse/core';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { TABNAME_OPTIONS, FLITERMENUOPTIONS } from '@/data/query';

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
const msg = useMessage();
const router = useRouter();
const route = useRoute();
const { locale } = useLocale();
const { t } = useI18n();

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
  if (v.length > 100) {
    return msg.danger({
      content: '文字长度不能超过100字符',
    });
  }

  isLoading.value = false;
  isFocus.value = false;
  searchInput.value = v;
  replaceWinUrl();
};

const replaceWinUrl = () => {
  searchRecommendRef.value?.getSearchHistory(searchInput.value);
  collectDownloadData(searchInput.value, defaultValue.value, tabName.value);
  router.push({
    path: `/${locale.value}/search`,
    query: {
      name: searchInput.value,
      tab: tabName.value,
      key: defaultValue.value,
    },
  });
};

// ---------------------搜索埋点--------------------
const collectDownloadData = (keyword: string, filter: string, pkg: string) => {
  const sensors = (window as any)['sensorsDataAnalytic201505'];
  const { href } = window.location;
  const downloadTime = new Date();
  sensors?.setProfile({
    ...(window as any)['sensorsCustomBuriedData'],
    profileType: 'search',
    origin: href,
    keyword,
    filter,
    pkg,
    downloadTime,
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
};

const changeSearchBlur = () => {
  const name = route.query.name as string;
  if (searchInput.value === '' || name !== searchInput.value) {
    searchInput.value = name;
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
        recommendList.value = [];
      }
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
  },
  { deep: true }
);
</script>

<template>
  <div ref="searchRef" class="search" :class="show ? 'xl' : 'large'">
    <OSelect
      v-model="defaultValue"
      style="width: 120px"
      :placeholder="FLITERMENUOPTIONS[0].name"
      variant="text"
      :size="show ? 'large' : 'medium'"
      round="0"
      @change="(v) => changeFilter(v)"
    >
      <OOption v-for="item in FLITERMENUOPTIONS" :key="item.id" :label="item.name" :value="item.id" />
    </OSelect>
    <div class="search-box">
      <OInput
        v-model="searchInput"
        :placeholder="t('software.searchPlaceholder')"
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
