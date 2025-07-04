<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { OLink, OInput, useMessage, OIcon } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import type { SorT } from '@/@types/type-sort';
import { useSearchStore } from '@/stores/search';

import IconTimeOrder from '~icons/app/icon-time-order.svg';

import IconSearch from '~icons/app/icon-search.svg';
import { searchReport } from '@/shared/analytics';

const props = defineProps({
  title: {
    type: String,
    default: () => {
      return '';
    },
  },
  total: {
    type: Number,
    default: () => 0,
  },
  isClear: {
    type: Boolean,
    default: () => false,
  },
  isTime: {
    type: Boolean,
    default: () => false,
  },
  type: {
    type: String,
    default: () => {
      return '';
    },
  },
});
const msg = useMessage();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { locale } = useLocale();

const emits = defineEmits<{
  (e: 'sort', value: string[] | string): void;
  (e: 'clear'): void;
}>();

const searchStore = useSearchStore();

const searchValue = ref(route.query.name as string | '');
const showPanel = ref(false);

// 搜索
const changeSearchInput = (v: string) => {
  changePkgInput(v);
  searchValue.value = v;
  replaceWinUrl();
};

const changePkgInput = (v: string) => {
  if (v === '') {
    return;
  }
  if (v.length > 100) {
    return msg.danger({
      content: '文字长度不能超过100字符',
    });
  }
};

const clearSearchData = () => {
  emits('clear');
  router.push({
    path: `/${locale.value}/` + (route.name as string),
  });
};

const replaceWinUrl = () => {
  collectDownloadData(searchValue.value);

  router.push({
    path: `/${locale.value}/` + (route.name as string),
    query: {
      name: searchValue.value,
    },
  });
};

// ---------------------搜索埋点--------------------
const collectDownloadData = (keyword: string) => {
  const { href } = window.location;
  const downloadTime = new Date();
  searchReport('search', {
    origin: href,
    keyword,
    filter: 'all',
    pkg: props.title,
    downloadTime,
  });
};

const isTimeOrder = ref(false);
const isNameOrder = ref(false);

const changeSortBy = (type: string, name: string) => {
  let v: SorT = '';
  clearSvgFill();

  const path = document.querySelector(`.filter-sort.${name} svg`);

  if (type === 'timeOrder') {
    isNameOrder.value = false;
    activeIndex.value = 0;
    isTimeOrder.value = !isTimeOrder.value;
    v = isTimeOrder.value ? 'asc' : 'desc';
    path?.children[isTimeOrder.value ? 1 : 0].setAttribute('fill', 'var(--o-color-info1)');

    searchStore.changeNameOrderState(false);
  } else if (type === 'nameOrder') {
    isTimeOrder.value = false;
    activeIndex.value = 1;
    isNameOrder.value = !isNameOrder.value;
    v = isNameOrder.value ? 'asc' : 'desc';
    path?.children[isNameOrder.value ? 1 : 0].setAttribute('fill', 'var(--o-color-info1)');
    // 修改状态
    searchStore.changeNameOrderState(true);
  }
  emits('sort', [type, v]);
};

// 重置svg颜色
const clearSvgFill = () => {
  const path = document.querySelectorAll(`.filter-sort svg`);
  path.forEach((item) => {
    item?.children[0].removeAttribute('fill');
    item?.children[1].removeAttribute('fill');
  });
};

// 清除筛选数据
// activeIndex -1清除全部 0最新排序、1首字母排序
const activeIndex = ref(-1);
const clearAll = () => {
  isTimeOrder.value = false;
  isNameOrder.value = false;
  activeIndex.value = -1;
  clearSvgFill();
  searchStore.changeNameOrderState(false);
  emits('sort', '');
};

const isPageSearch = ref(false);
onMounted(() => {
  isPageSearch.value = route.name === 'search';
});

watch(
  () => route.query.name as string,
  (v: string) => {
    searchValue.value = v;
  }
);

watch(
  () => props.isClear,
  (v: boolean) => {
    if (v) {
      clearAll();
    }
  }
);

const getSearchplaceholder = (name: string) => {
  const placeholder = {
    CONDA: '软件包名称',
    OEPKG: '软件包名称',
    IMAGE: '镜像名称',
    RPM: '软件包名称',
    DOMAIN: '相关信息',
    EPKG: '软件包名称',
    APPVERSION: '应用名称',
  };
  const title = {
    CONDA: 'CONDA',
    OEPKG: 'OEPKG',
    RPM: 'RPM',
    IMAGE: '应用',
    EPKG: 'EPKG',
    DOMAIN: '领域应用',
    APPVERSION: '',
  };
  return `${title[name]}${placeholder[name]}`;
};
</script>

<template>
  <div class="filter-header">
    <div class="search-left">
      <template v-if="isPageSearch">
        <p class="text">
          为您找到<span class="total">{{ total }}</span> 个与 <span class="search-value">{{ searchValue }}</span
          >匹配的搜索结果
        </p>
      </template>
      <OInput
        v-else
        :placeholder="`${t('software.filterPleaseEnter[0]')}${getSearchplaceholder(title)}`"
        :style="{ width: '348px' }"
        size="large"
        :max-length="100"
        clearable
        @focus="showPanel = true"
        v-model="searchValue"
        @press-enter="(v) => changeSearchInput(v)"
        @input="(v) => changePkgInput(v)"
        @clear="clearSearchData"
      >
        <template #prefix>
          <OIcon> <IconSearch @click="changeSearchInput(searchValue)" /></OIcon>
        </template>
      </OInput>
    </div>
    <div v-if="type === 'all'" class="search-right">
      <OLink @click="clearAll()" class="filter-sort" :class="{ active: activeIndex === -1 }">
        {{ t('software.sortTitle') }}
      </OLink>
      <template v-if="isTime">
        <OLink @click="changeSortBy('timeOrder', 'time')" class="filter-sort time" :class="{ active: activeIndex === 0 }">
          {{ t('software.timeOrder') }}
          <template #suffix
            ><OIcon><IconTimeOrder /></OIcon
          ></template>
        </OLink>
      </template>
      <OLink @click="changeSortBy('nameOrder', 'name')" class="filter-sort name" :class="{ active: activeIndex === 1 }">
        {{ t('software.nameOrder') }}
        <template #suffix
          ><OIcon><IconTimeOrder /></OIcon
        ></template>
      </OLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .lable {
    @include text1;
    color: var(--o-color-info1);
    font-weight: 600;
  }

  .search-right {
    display: flex;
    align-items: center;
    :deep(.o-select) {
      width: 98px;
      padding: 0;
      .o-select-input {
        @include text1;
      }
      .o-select-arrow {
        font-size: 24px;
        color: var(--o-color-info2);
      }
    }
  }
  .filter-sort {
    display: flex;
    margin-left: 24px;
    user-select: none;
    align-items: center;
    color: var(--o-color-info2);
    &.active {
      color: var(--o-color-info1);
      font-weight: 500;
    }
    .o-icon {
      color: var(--o-color-info4);
    }
  }
  .search-left {
    flex: 1;
    .search-value {
      max-width: 480px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      margin: 0 4px;
    }
    .text {
      @include tip1;
      color: var(--o-color-info3);
      display: flex;
      align-items: center;

      .total {
        color: var(--o-color-info1);
        font-weight: 500;
        margin: 0 4px;
      }
    }
    .o-input {
      --input-radius: 4px;
      transition: all 0.3s;
      svg {
        width: 20px;
      }
    }
  }
}
</style>
