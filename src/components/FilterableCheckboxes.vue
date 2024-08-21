<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { OCheckbox, OCheckboxGroup, OInput, OScroller } from '@opensig/opendesign';

import IconSearch from '~icons/app/icon-search.svg';
import { useCheckbox } from '@/composables/useCheckbox';

const props = defineProps({
  /** 是否显示筛选输入 */
  filterable: {
    type: Boolean,
    default: true,
  },
  /** 多选值 */
  values: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 是否开启检测滚动到底部 */
  detectScrollBottom: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: 'change', values: (string | number)[]): void
  (event: 'scrollBottom'): void
}>();

const wrapDiv = ref<HTMLDivElement>();

const onScroll = (event: Event) => {
  const el = event.target as HTMLDivElement;
  if (el.scrollHeight - Math.round(el.scrollTop) <= el.clientHeight) {
    emit('scrollBottom');
  }
};

onMounted(() => {
  if (props.detectScrollBottom) {
    const container = wrapDiv.value?.querySelector('.o-scroller-container') as HTMLDivElement;
    container && container.addEventListener('scroll', onScroll);
  }
});

onUnmounted(() => {
  if (props.detectScrollBottom) {
    const container = wrapDiv.value?.querySelector('.o-scroller-container') as HTMLDivElement;
    container && container.removeEventListener('scroll', onScroll);
  }
})

const searchVal = ref<string>();

const actualValues = computed(() => {
  const search = searchVal.value;
  if (search) {
    return props.values.filter((val) => val.includes(search));
  } else {
    return props.values;
  }
});

const onFilterInput = useDebounceFn((search?: string) => {
  searchVal.value = search;
}, 200);

const { checkboxes, parentCheckbox, indeterminate } = useCheckbox(actualValues, (item) => item);

watch(checkboxes, (values) => emit('change', values));
</script>

<template>
  <div class="filterable-checkboxes-wrap" :style="filterable ? {} : { paddingTop: '0' }" ref="wrapDiv">
    <OInput v-if="filterable" clearable @clear="onFilterInput()" @input="onFilterInput" class="filter-input" placeholder="搜索">
      <template #prefix>
        <IconSearch />
      </template>
    </OInput>
    <OScroller class="content">
      <div class="check-all-wrap">
        <OCheckbox v-model="parentCheckbox" :indeterminate="indeterminate" :value="1">全选</OCheckbox>
      </div>
      <OCheckboxGroup v-model="checkboxes" direction="v">
        <OCheckbox v-for="item in actualValues" :key="item" :value="item">{{ item }}</OCheckbox>
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
