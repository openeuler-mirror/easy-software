<script setup lang="ts">
import type { SorT } from '@/@types/type-sort';
import { OLink } from '@opensig/opendesign';
import { watch } from 'vue';
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

watch(
  () => props.sort,
  (val) => {
    const path = document.querySelector(`.filter-sort svg`);
    path?.children[0].setAttribute('fill', '#bdbdbd');
    path?.children[1].setAttribute('fill', '#bdbdbd');
    if (!val) {
      return;
    }
    path?.children[val === 'desc' ? 1 : 0].setAttribute('fill', '#000');
  },
  { immediate: true }
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
  <OLink @click="changeSort" class="filter-sort">
    {{ text }}
    <template #suffix><IconTimeOrder /></template>
  </OLink>
</template>
