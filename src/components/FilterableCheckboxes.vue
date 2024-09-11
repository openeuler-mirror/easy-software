<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { OButton, OCheckbox, OCheckboxGroup, ODivider, OIcon, OInput, OLink, ORadio, ORadioGroup, OScroller } from '@opensig/opendesign';

import IconSearch from '~icons/app/icon-search.svg';
import IconLoading from '~icons/app/icon-loading.svg';
import { useCheckbox } from '@/composables/useCheckbox';

type ValueT = string | { label: string; value: string };

const props = defineProps({
  modelValue: {
    type: [Array, String, Number] as PropType<(string | number)[] | string | number>,
    default: '',
  },
  /** 是否显示搜索 */
  filterable: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否可多选 */
  multi: {
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
  (e: 'update:modelValue', val: (string | number)[] | string | number): void;
  (event: 'change', val: (string | number)[] | string | number): void;
}>();

const empty = ref(false);

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

watch(
  () => filteredValues.value.length,
  (len) => (empty.value = len <= 0),
  { immediate: true }
);

const displayCount = ref(30);
const displayValues = computed(() => {
  return filteredValues.value.slice(0, Math.min(filteredValues.value.length, displayCount.value));
});

const scrollerRef = ref<InstanceType<typeof OScroller>>();

const onScroll = (event: Event) => {
  const el = event.target as HTMLDivElement;
  if (el.scrollHeight - Math.round(el.scrollTop) <= el.clientHeight) {
    console.log('???')
    displayCount.value += 30;
  }
};

onMounted(() => {
  const container = scrollerRef.value?.getContainerEl() as HTMLDivElement;
  container && container.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  const container = scrollerRef.value?.getContainerEl() as HTMLDivElement;
  container && container.removeEventListener('scroll', onScroll);
});

const onFilterInput = useDebounceFn((search?: string) => {
  // 重置显示个数
  displayCount.value = 30;
  searchVal.value = search;
}, props.filterDebounceTimeout);

const radioVal = computed({
  get() {
    return props.multi ? '' : (props.modelValue as string | number);
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const checkboxVal = computed({
  get() {
    if (props.multi) {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue;
      }
      if (typeof props.modelValue === 'string' && props.modelValue.indexOf(',') !== -1) {
        return props.modelValue.split(',');
      }
    }
    return [];
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

watch(
  () => checkboxVal.value,
  (val) => {
    if (val?.length) {
      checkboxes.value = val;
    }
  }
);

const { checkboxes, parentCheckbox, indeterminate, isCheckedAll, clearCheckboxes } = useCheckbox(rawValues, (item) => item.value);

const checkboxConfirm = () => {
  if (!checkboxes.value.length || isCheckedAll.value) {
    checkboxVal.value = [];
    emit('change', []);
    return;
  }
  checkboxVal.value = checkboxes.value;
  emit('change', checkboxes.value);
};

const checkboxReset = () => {
  if (checkboxes.value.length) {
    clearCheckboxes();
    checkboxConfirm();
  }
};
</script>

<template>
  <div class="filterable-checkboxes-wrap" :style="filterable ? {} : { paddingTop: '0' }">
    <OInput v-if="filterable" clearable @clear="onFilterInput()" @input="onFilterInput" class="filter-input" placeholder="搜索">
      <template #prefix>
        <OIcon class="search-icon">
          <IconSearch />
        </OIcon>
      </template>
    </OInput>
    <OScroller class="content" showType="always" ref="scrollerRef">
      <div class="mask" v-if="loading">
        <OIcon><IconLoading class="o-rotating" /></OIcon>
      </div>
      <div class="mask" v-else-if="empty">
        <p class="info">没有匹配的数据</p>
      </div>
      <template v-if="multi">
        <div class="check-all-wrap">
          <OCheckbox v-model="parentCheckbox" :indeterminate="indeterminate" :value="1">全选</OCheckbox>
        </div>
        <OCheckboxGroup v-model="checkboxes" direction="v">
          <OCheckbox v-for="item in displayValues" :key="item.value" :value="item.value">{{ item.label }}</OCheckbox>
        </OCheckboxGroup>
      </template>
      <template v-else>
        <div class="check-all-wrap">
          <ORadio @change="$emit('change', $event as string)" v-model="radioVal" :value="''">全选</ORadio>
        </div>
        <ORadioGroup v-model="radioVal" direction="v" @change="$emit('change', $event as string)">
          <ORadio v-for="item in displayValues" :key="item.value" :value="item.value">{{ item.label }}</ORadio>
        </ORadioGroup>
      </template>
    </OScroller>
    <template v-if="multi">
      <ODivider direction="h"></ODivider>
      <div class="btn-wrap">
        <OLink color="primary" @click="checkboxReset">重置</OLink>
        <OButton class="confirm-btn" color="primary" variant="outline" round="pill" size="medium" @click="checkboxConfirm">确定</OButton>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
:deep(.o-divider-line) {
  position: absolute;
  left: 0;
}

.btn-wrap {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;

  .confirm-btn {
    margin-left: 46px;
  }
}

.mask {
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

  .info {
    @include tip1;
    color: var(--o-color-info1);
  }
}

.search-icon {
  color: var(--o-color-info1);
}

.filterable-checkboxes-wrap {
  background-color: var(--o-color-fill2);
  padding-top: 0px;
  padding-bottom: 8px;
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
