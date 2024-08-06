<script setup lang="ts">
import type { SorT } from '@/@types/type-sort';
import { OLink, OIcon } from '@opensig/opendesign';
import { onMounted, watch } from 'vue';
import IconTimeOrder from '~icons/app/icon-time-order.svg';

const props = withDefaults(
  defineProps<{
    text: string;
    sort?: SorT;
  }>(),
  {
    sort: '',
  }
);
const emits = defineEmits<{
  (event: 'update:sort', value: SorT): void;
}>();

// 重置svg颜色
const clearSvgFill = () => {
  const path = document.querySelectorAll(`.filter-sort svg`);
  path.forEach((item) => {
    item?.children[0].removeAttribute('fill');
    item?.children[1].removeAttribute('fill');
  });
};

onMounted(() => {
  clearSvgFill();
  const path = document.querySelector(`.filter-sort svg`);
  path?.children[props.sort === 'desc' ? 1 : 0].setAttribute('fill', '#000');
});

watch(
  () => props.sort,
  (val) => {
    const path = document.querySelector(`.filter-sort svg`);
    clearSvgFill();
    if (!val) {
      return;
    }
    path?.children[val === 'desc' ? 1 : 0].setAttribute('fill', '#000');
  }
);

const changeSort = () => {
  if (props.sort !== 'asc') {
    emits('update:sort', 'asc');
  } else {
    emits('update:sort', 'desc');
  }
};
</script>

<template>
  <OLink @click="changeSort" class="filter-sort" size="small">
    {{ text }}
    <template #suffix
      ><OIcon><IconTimeOrder /></OIcon
    ></template>
  </OLink>
</template>

<style lang="scss" scoped>
.filter-sort {
  display: flex;
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
</style>
