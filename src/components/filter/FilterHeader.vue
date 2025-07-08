<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { OLink, OInput, useMessage, OIcon } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { SORTPARAMS } from '@/data/query';
import { useSearchStore } from '@/stores/search';
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

const emits = defineEmits<{
  (e: 'sort', value: string[] | string): void;
  (e: 'search', value: string): void;
  (e: 'clear'): void;
}>();

const searchStore = useSearchStore();

const searchValue = ref('');
const showPanel = ref(false);

// 搜索
const changeSearchInput = () => {
  changePkgInput();
  replaceWinUrl();
};

const changePkgInput = () => {
  if (searchValue.value === '') {
    return;
  }
  if (searchValue.value && searchValue.value.length > 100) {
    return msg.danger({
      content: '文字长度不能超过100字符',
    });
  }
};

const clearSearchData = () => {
  emits('clear');
  router.push({
    query: {
      q: undefined,
    },
  });
};

const replaceWinUrl = () => {
  collectDownloadData(searchValue.value);
  emits('search', searchValue.value);
  router.push({
    query: {
      q: searchValue.value,
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

// 排序事件
const timeIndex = ref(0);
const nameIndex = ref(0);
const changeSortBy = (type: string) => {
  const updateIndex = (index) => {
    if (index.value >= 2) {
      index.value = 0;
    } else {
      index.value++;
    }
  };

  if (type === 'name') {
    updateIndex(nameIndex);
    emits('sort', ['name', nameIndex.value]);
  } else if (type === 'time') {
    updateIndex(timeIndex);
    emits('sort', ['time', timeIndex.value]);
  } else {
    return;
  }
};

// 清除筛选数据
const clearAll = () => {
  timeIndex.value = 0;
  nameIndex.value = 0;

  searchStore.changeNameOrderState(false);
  emits('sort', '');
};

const isPageSearch = ref(false);
onMounted(() => {
  isPageSearch.value = route.name === 'search';

  searchValue.value = route.query?.name ?? route.query?.q ?? '';
});

watch(
  () => (route.query?.name as string) || (route.query?.q as string),
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
        round="4px"
        :max-length="100"
        clearable
        @focus="showPanel = true"
        v-model="searchValue"
        @press-enter="changeSearchInput"
        @input="changePkgInput"
        @clear="clearSearchData"
      >
        <template #prefix>
          <OIcon> <IconSearch @click="changeSearchInput" /></OIcon>
        </template>
      </OInput>
    </div>
    <div v-if="type === 'all'" class="search-right">
      <OLink @click="clearAll()" class="filter-sort">
        {{ t('software.sortTitle') }}
      </OLink>
      <template v-if="isTime">
        <OLink @click="changeSortBy('time')" class="filter-sort time">
          {{ t('software.timeOrder') }}
          <span class="sort-icon" :class="SORTPARAMS[timeIndex]"></span>
        </OLink>
      </template>
      <OLink @click="changeSortBy('name')" class="filter-sort name">
        {{ t('software.nameOrder') }}
        <span class="sort-icon" :class="SORTPARAMS[nameIndex]"></span>
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
