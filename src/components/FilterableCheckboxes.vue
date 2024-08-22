<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { OCheckbox, OCheckboxGroup, OInput, OScroller } from '@opensig/opendesign';

import IconSearch from '~icons/app/icon-search.svg';
import { useCheckbox } from '@/composables/useCheckbox';

type ValueT = string | { label: string; value: string };

const props = defineProps({
  /** 是否显示筛选输入 */
  filterable: {
    type: Boolean,
    default: true,
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
  (event: 'change', val: { values: (string | number)[]; isCheckAll: boolean }): void;
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
  const search = searchVal.value;
  if (search) {
    return rawValues.value.filter((val) => val.label.includes(search));
  } else {
    return rawValues.value;
  }
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

const { checkboxes, parentCheckbox, indeterminate, isCheckedAll } = useCheckbox(
  () => rawValues.value,
  (item) => item.value
);

watch(checkboxes, (values) => emit('change', { values, isCheckAll: isCheckedAll.value }));
</script>

<template>
  <div class="filterable-checkboxes-wrap" :style="filterable ? {} : { paddingTop: '0' }" ref="wrapDiv">
    <OInput v-if="filterable" clearable @clear="onFilterInput()" @input="onFilterInput" class="filter-input" placeholder="搜索">
      <template #prefix>
        <IconSearch />
      </template>
    </OInput>
    <OScroller class="content" showType="always">
      <div class="check-all-wrap">
        <OCheckbox v-model="parentCheckbox" :indeterminate="indeterminate" :value="1">全选</OCheckbox>
      </div>
      <OCheckboxGroup v-model="checkboxes" direction="v">
        <OCheckbox v-for="item in displayValues" :key="item.value" :value="item.value">{{ item.label }}</OCheckbox>
      </OCheckboxGroup>
    </OScroller>
  </div>
</template>

<style lang="scss" scoped>
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
