<script lang="ts" setup>
import { ref, watch } from 'vue';
import { OIcon, OLoading } from '@opensig/opendesign';
import IconLoading from '~icons/app/icon-loading.svg';
const props = defineProps({
  loading: {
    type: Boolean,
    default: () => false,
  },
});

const isLoading = ref(props.loading);

watch(
  () => props.loading,
  () => {
    isLoading.value = props.loading;
  }
);
</script>

<template>
  <OLoading v-model:visible="isLoading" :wrapper="null">
    <OIcon><IconLoading class="o-rotating" /></OIcon>加载中
  </OLoading>
</template>

<style lang="scss" scoped></style>
