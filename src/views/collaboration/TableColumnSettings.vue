<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { OCheckbox, OCheckboxGroup, OScroller } from '@opensig/opendesign';
import { type CollaborationColumnsT } from '@/@types/collaboration';

const props = defineProps({
  options: {
    type: Array as PropType<CollaborationColumnsT[]>,
    required: true,
  },
  modelValue: {
    type: Array as PropType<Array<string>>,
  },
});

const emits = defineEmits<{
  (e: 'update:modelValue', val: string[]): void;
}>();

const checkboxValue = useVModel(props, 'modelValue', emits);

// 获取可操作的项
const getActionableItems = computed(() => props.options.filter((item) => !item.isDefault).map((item) => item.key));

const onChange = (option: string[]) => {
  const activeArr = getActionableItems.value.filter((item) => option.includes(item));
  localStorage.setItem('collaboration-columns', JSON.stringify(activeArr));
};
</script>

<template>
  <div class="check-box">
    <OScroller class="content" showType="always" :style="{ '--scroller-padding': '0 16px 0 0' }">
      <OCheckboxGroup v-model="checkboxValue" direction="v" @change="onChange" :style="{ '--checkbox-group-gap': '12px' }">
        <template v-for="item in options" :key="item.key">
          <OCheckbox :disabled="item.isDefault" :value="item.key">
            {{ item.label }}
          </OCheckbox>
        </template>
      </OCheckboxGroup>
    </OScroller>
  </div>
</template>

<style lang="scss" scoped>
.content {
  padding: 4px 8px 4px 4px;
  max-height: 292px;
  :deep(.o-checkbox) {
    @include tip1;
    height: 38px;
    margin: 0 !important;
  }
}
</style>
