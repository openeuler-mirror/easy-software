<script lang="ts" setup>
import { computed } from 'vue';
import { OPagination } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { COUNT_PAGESIZE, COUNT_PAGESIZE_FIELD } from '@/data/query';

defineProps({
  current: {
    type: Number,
    default: 1,
  },
  pagesize: {
    type: Number,
    default: 12,
  },
  total: {
    type: Number,
    default: 0,
  },
});
const route = useRoute();

const emit = defineEmits(['size-change', 'current-change']);

const onChange = (newValue: { page: number; pageSize: number }, oldValue: { page: number; pageSize: number }) => {
  if (newValue.pageSize !== oldValue.pageSize) {
    emit('size-change', newValue.pageSize);
  }
  if (newValue.page !== oldValue.page) {
    emit('current-change', newValue.page);
  }
};

// 如果是领域应用 分页数量为12条，否则为20条
const pageSizes = computed(() => (route.name === 'field' || route.name === 'image' || route.query?.tab === 'all' ? COUNT_PAGESIZE_FIELD : COUNT_PAGESIZE));
</script>

<template>
  <OPagination :page="current" round="4px" variant="outline" :pageSize="pagesize" :total="total" show-total @change="onChange" :page-sizes="pageSizes" />
</template>

<style lang="scss" scoped></style>
