<script lang="ts" setup>
import { ref } from 'vue';
import type { PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { OCheckbox, OCheckboxGroup, OLink, OIcon } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';

const props = defineProps({
  options: {
    type: Array as PropType<Array<string>>,
    required: true,
  },
  modelValue: {
    type: Array as PropType<Array<string>>,
  },
});

const { t } = useI18n();

const emits = defineEmits<{
  (e: 'update:modelValue', val: string[]): void;
  (e: 'change', option: string[]): void;
  (e: 'clear'): void;
}>();

const checkboxValue = useVModel(props, 'modelValue', emits);
const onChange = (option: string[]) => {
  emits('change', option);
};

const DEFAULT_NUM = 5;
const showLen = ref(DEFAULT_NUM);
const filterList = ref(props.options);
const isAll = ref(false);
const showMoreItem = () => {
  showLen.value = isAll.value ? DEFAULT_NUM : props.options.length;
  isAll.value = !isAll.value;
};
</script>

<template>
  <div class="filter-box">
    <div class="filter-header">
      <slot name="header"></slot>
    </div>
    <OCheckboxGroup class="filter-options" v-model="checkboxValue" @change="() => onChange">
      <template v-for="(option, idx) in filterList">
        <OCheckbox v-if="idx < showLen" :key="option" :value="option">
          {{ option }}
        </OCheckbox>
      </template>
    </OCheckboxGroup>
    <p v-if="options.length >= showLen && options.length !== DEFAULT_NUM" @click="showMoreItem" class="view-all">
      <OLink color="primary" :class="isAll ? 'up' : 'down'" size="small">
        {{ isAll ? t('software.upList') : t('software.viewAll') }}
        <template #suffix>
          <OIcon><IconChevronDown /></OIcon>
        </template>
      </OLink>
    </p>
  </div>
</template>

<style lang="scss" scoped>
:deep(.o-checkbox-group) {
  display: flex;
  flex-direction: column;
  margin-left: 28px;
  .o-checkbox {
    margin: 8px 0;
  }
  .o-checkbox-checked .o-checkbox-label {
    color: var(--o-color-info1);
    font-weight: 500;
  }
}
.filter-box {
  margin-bottom: 24px;
  .view-all {
    margin-left: 60px;
    .o-link-small {
      @include tip2;
    }
  }
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .filter-title {
      @include text1;
      font-weight: 600;
      color: var(--o-color-info1);
      display: flex;
      align-items: center;
      .o-icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
        font-size: 24px;
      }
    }
  }

  svg {
    color: var(--o-color-primary1);
    transition: 0.3s ease-in-out;
  }
  .up svg {
    transform: rotate(180deg);
  }
}
</style>
