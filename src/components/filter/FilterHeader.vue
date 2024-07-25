<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { OLink, OInput, useMessage } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import type { SorT } from '@/@types/type-sort';
import { useSearchStore } from '@/stores/search';

import IconTimeOrder from '~icons/app/icon-time-order.svg';
import IconSearch from '~icons/app/icon-search.svg';

defineProps({
  title: {
    type: String,
    default: () => {
      return '';
    },
  },
  isSort: {
    type: Boolean,
    default: () => true,
  },
  total: {
    type: Number,
    default: () => 0,
  },
});

const msg = useMessage();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { locale } = useLocale();

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
  router.push({
    path: `/${locale.value}/` + (route.name as string),
  });
};

const replaceWinUrl = () => {
  router.push({
    path: `/${locale.value}/` + (route.name as string),
    query: {
      name: searchValue.value,
    },
  });
};
const emits = defineEmits<{
  (e: 'sort', value: string[]): void;
  (e: 'clear'): void;
}>();

const isTimeOrder = ref(false);
const isNameOrder = ref(false);

const changeSortBy = (type: string, name: string) => {
  let v: SorT = '';
  clearSvgFill();

  const path = document.querySelector(`.filter-sort.${name} svg`);
  // 重置svg颜色
  path?.children[0].setAttribute('fill', '#bdbdbd');
  path?.children[1].setAttribute('fill', '#bdbdbd');

  if (type === 'timeOrder') {
    isNameOrder.value = false;
    activeIndex.value = 0;
    isTimeOrder.value = !isTimeOrder.value;
    v = isTimeOrder.value ? 'asc' : 'desc';
    path?.children[isTimeOrder.value ? 1 : 0].setAttribute('fill', '#000');

    searchStore.changeNameOrderState(false);
  } else if (type === 'nameOrder') {
    isTimeOrder.value = false;
    activeIndex.value = 1;
    isNameOrder.value = !isNameOrder.value;
    v = isNameOrder.value ? 'asc' : 'desc';
    path?.children[isNameOrder.value ? 1 : 0].setAttribute('fill', '#000');
    // 修改状态
    searchStore.changeNameOrderState(true);
  }
  emits('sort', [type, v]);
};

// 重置svg颜色
const clearSvgFill = () => {
  const path = document.querySelectorAll(`.filter-sort svg`);
  path.forEach((item) => {
    item?.children[0].setAttribute('fill', '#bdbdbd');
    item?.children[1].setAttribute('fill', '#bdbdbd');
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
  emits('clear');
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
</script>

<template>
  <div class="filter-header">
    <div class="search-left">
      <template v-if="isPageSearch">
        <p class="text">
          为您找到<span class="total">{{ total }}</span> 个与 <span class="search-value">{{ searchValue }}</span> 匹配的搜索结果
        </p>
      </template>
      <OInput
        v-else
        :placeholder="`${t('software.filterPleaseEnter[0]')}${title}${t('software.filterPleaseEnter[1]')}`"
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
          <IconSearch @click="changeSearchInput(searchValue)" />
        </template>
      </OInput>
    </div>
    <div class="search-right">
      <OLink @click="clearAll()" class="filter-sort" :class="{ active: activeIndex === -1 }">
        {{ t('software.sortTitle') }}
      </OLink>
      <template v-if="isSort">
        <OLink @click="changeSortBy('timeOrder', 'time')" class="filter-sort time" :class="{ active: activeIndex === 0 }">
          {{ t('software.timeOrder') }}
          <template #suffix><IconTimeOrder /></template>
        </OLink>
      </template>
      <OLink @click="changeSortBy('nameOrder', 'name')" class="filter-sort name" :class="{ active: activeIndex === 1 }">
        {{ t('software.nameOrder') }}
        <template #suffix><IconTimeOrder /></template>
      </OLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
svg.asc {
  color: red;
  path {
    fill: blue;
  }
}
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
    &.asc {
      color: var(--o-color-info3);
      svg path:first-child {
        color: var(--o-color-primary1);
      }
    }
    &.active {
      color: var(--o-color-info1);
      font-weight: 600;
    }
  }
  .search-left {
    flex: 1;
    .search-value {
      max-width: 480px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
    }
    .text {
      @include tip1;
      color: var(--o-color-info3);
      display: flex;
      align-items: center;

      .total {
        color: var(--o-color-info1);
        font-weight: 600;
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
