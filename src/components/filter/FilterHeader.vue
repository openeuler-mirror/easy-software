<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { OLink, OInput } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import type { SorT } from '@/@types/type-sort';
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

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { locale } = useLocale();

const searchValue = ref(route.query.name as string | '');
const showPanel = ref(false);

// 搜索
const changeSearchInput = (v: string) => {
  searchValue.value = v;
  replaceWinUrl();
};

const clearSearchData = () => {
  replaceWinUrl();
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
}>();

const isTimeOrder = ref(false);
const isNameOrder = ref(false);
const changeSortBy = (type: string) => {
  let v: SorT = '';
  if (type === 'timeOrder') {
    isTimeOrder.value = !isTimeOrder.value;
    v = isTimeOrder.value ? 'asc' : 'desc';
  } else if (type === 'nameOrder') {
    isNameOrder.value = !isNameOrder.value;
    v = isNameOrder.value ? 'asc' : 'desc';
  }
  emits('sort', [type, v]);
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
    <div class="search-right">
      <template v-if="isPageSearch">
        <p class="text">
          为您找到<span class="total">{{ total }}</span> 个与 <span>{{ searchValue }}</span> 匹配的搜索结果
        </p>
      </template>
      <OInput
        v-else
        :placeholder="`${t('software.filterPleaseEnter[0]')}${title}${t('software.filterPleaseEnter[1]')}`"
        :style="{ width: '348px' }"
        size="large"
        clearable
        @focus="showPanel = true"
        v-model="searchValue"
        @press-enter="(v) => changeSearchInput(v)"
        @clear="clearSearchData"
      >
        <template #prefix>
          <IconSearch @click="changeSearchInput(searchValue)" />
        </template>
      </OInput>
    </div>
    <div class="search-left">
      <template v-if="isSort">
        <OLink @click="changeSortBy('timeOrder')" class="filter-sort">
          {{ t('software.timeOrder') }}
          <template #suffix><IconTimeOrder /></template>
        </OLink>
      </template>
      <OLink @click="changeSortBy('nameOrder')" class="filter-sort">
        {{ t('software.nameOrder') }}
        <template #suffix><IconTimeOrder /></template>
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
  .text {
    @include tip1;
    color: var(--o-color-info3);
    .total {
      color: var(--o-color-info1);
      font-weight: 600;
      margin: 0 4px;
    }
  }
  .search-left {
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
    align-items: center;
    &.new {
      color: var(--o-color-primary1);
      svg {
        fill: currentColor;
      }
    }
  }
  .search-right {
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
