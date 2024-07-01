<script lang="ts" setup>
import { useLocale } from '@/composables/useLocale';
import { ElPagination, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

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
const pageSizes = [12, 24, 48, 96];
const emit = defineEmits(['size-change', 'current-change']);
const { isZh } = useLocale();

const handleSizeChange = (val: number) => {
  emit('size-change', val);
};
const handleCurrentChange = (val: number) => {
  emit('current-change', val);
};
</script>

<template>
  <el-config-provider :locale="isZh ? zhCn : English">
    <el-pagination
      :current-page="current"
      :page-size="pagesize"
      background
      layout="sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="pageSizes"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-config-provider>
</template>

<style lang="scss" scoped></style>
