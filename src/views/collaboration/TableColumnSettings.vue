<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { OCheckbox, OCheckboxGroup, OScroller } from '@opensig/opendesign';
import { type CollaborationColumnsT } from '@/@types/collaboration';
import xss from 'xss';

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
const getActionableItems = computed(() => {
  let arr: string[] = [];
  props.options.forEach((item) => {
    if (!item.isDefault) {
      arr.push(item.key);
    }
  });
  return arr;
});

const onChange = (option: string[]) => {
  const activeArr: string[] = [];
  getActionableItems.value.forEach((item) => {
    if (option.includes(item)) {
      activeArr.push(item);
    }
  });
  localStorage.setItem('collaborationColumns', xss(activeArr.join()));
};
</script>

<template>
  <div class="check_box">
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
  padding: 8px;
  max-height: 320px;
  :deep(.o-checkbox) {
    @include tip1;
  }
}
</style>
