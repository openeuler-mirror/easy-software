<script setup lang="ts">
import type { SorT } from '@/@types/type-sort';
import { OLink } from '@opensig/opendesign';
import { ref, watch } from 'vue';
import IconTimeOrder from '~icons/app/icon-time-order.svg';

defineProps<{
  text: string;
}>();
const emits = defineEmits<{
  (event: 'change', value: SorT): void
}>();

const sort = ref<SorT>('');

watch(
  sort,
  (val) => {
    const path = document.querySelector(`.filter-sort svg`);
    path?.children[0].setAttribute('fill', '#bdbdbd');
    path?.children[1].setAttribute('fill', '#bdbdbd');
    if (!val) {
      return;
    }
    path?.children[val === 'desc' ? 1 : 0].setAttribute('fill', '#000');
    emits('change', val);
  },
  { immediate: true }
);

const changeSort = () => sort.value = sort.value !== 'asc' ? 'asc' : 'desc';
</script>

<template>
  <OLink @click="changeSort" class="filter-sort">
    {{ text }}
    <template #suffix><IconTimeOrder /></template>
  </OLink>
</template>