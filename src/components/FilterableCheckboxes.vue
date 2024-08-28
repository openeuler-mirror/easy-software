<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { OIcon, OInput, ORadio, ORadioGroup, OScroller } from '@opensig/opendesign';

import IconSearch from '~icons/app/icon-search.svg';
import IconLoading from '~icons/app/icon-loading.svg';

type ValueT = string | { label: string; value: string };

const props = defineProps({
  /** 是否显示搜索 */
  filterable: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  /** 多选值 */
  values: {
    type: Array as PropType<ValueT[]>,
    default: () => [],
  },
  filterDebounceTimeout: {
    type: Number,
    default: 300,
  },
});

const emit = defineEmits<{
  (event: 'change', val: string): void;
}>();

const rawValues = computed(() =>
  props.values.map((val) => {
    if (typeof val === 'string') {
      return { label: val, value: val };
    }
    return val;
  })
);

const searchVal = ref<string>();

const filteredValues = computed(() => {
  if (!searchVal.value) {
    return rawValues.value;
  }
  const search = searchVal.value.toLowerCase();
  return rawValues.value.filter((val) => val.label.toLowerCase().includes(search));
});

const displayCount = ref(30);
const displayValues = computed(() => {
  return filteredValues.value.slice(0, Math.min(filteredValues.value.length, displayCount.value));
});

const wrapDiv = ref<HTMLDivElement>();

const onScroll = (event: Event) => {
  const el = event.target as HTMLDivElement;
  if (el.scrollHeight - Math.round(el.scrollTop) <= el.clientHeight) {
    displayCount.value += 30;
  }
};

onMounted(() => {
  const container = wrapDiv.value?.querySelector('.o-scroller-container') as HTMLDivElement;
  container && container.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  const container = wrapDiv.value?.querySelector('.o-scroller-container') as HTMLDivElement;
  container && container.removeEventListener('scroll', onScroll);
});

const onFilterInput = useDebounceFn((search?: string) => {
  // 重置显示个数
  displayCount.value = 30;
  searchVal.value = search;
}, props.filterDebounceTimeout);

const radioVal = ref('');

watch(radioVal, (val) => emit('change', val));
</script>

<template>
  <div class="filterable-checkboxes-wrap" :style="filterable ? {} : { paddingTop: '0' }" ref="wrapDiv">
    <OInput v-if="filterable" clearable @clear="onFilterInput()" @input="onFilterInput" class="filter-input" placeholder="搜索">
      <template #prefix>
        <OIcon class="search-icon">
          <IconSearch />
        </OIcon>
      </template>
    </OInput>
    <OScroller class="content" showType="always">
      <div class="loading-mask" v-show="loading">
        <OIcon><IconLoading class="o-rotating" /></OIcon>
      </div>
      <div class="check-all-wrap">
        <ORadio v-model="radioVal" :value="''">全选</ORadio>
      </div>
      <ORadioGroup v-model="radioVal" direction="v">
        <ORadio v-for="item in displayValues" :key="item.value" :value="item.value">{{ item.label }}</ORadio>
      </ORadioGroup>
    </OScroller>
  </div>
</template>

<style lang="scss" scoped>
.loading-mask {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--o-color-fill2);
  z-index: 2;
  left: 0;
  top: 0;
}

.search-icon {
  color: var(--o-color-info1);
}

.filterable-checkboxes-wrap {
  background-color: var(--o-color-fill2);
  padding: 8px;
  border-radius: 4px;

  .filter-input {
    --input-radius: 4px;
    width: 100%;
  }

  .content {
    padding: 12px;
    padding-bottom: 0;
    max-height: 200px;
  }

  .check-all-wrap {
    padding: 16px 0;
    padding-top: 0;
  }
}
</style>
