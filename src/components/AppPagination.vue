<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { useRoute } from 'vue-router';
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
const route = useRoute();

const pageSizesField = [12, 24, 48, 96];
const pageSizes = [10, 20, 40, 90];
const emit = defineEmits(['size-change', 'current-change']);
const { isZh } = useLocale();

const handleSizeChange = (val: number) => {
  emit('size-change', val);
};
const handleCurrentChange = (val: number) => {
  emit('current-change', val);
};

const isFieldPage = ref(false);

onMounted(() => {
  isFieldPage.value = route.name === 'apppkg' || route.query?.tab === 'all';
});
</script>

<template>
  <el-config-provider :locale="isZh ? zhCn : English">
    <el-pagination
      :current-page="current"
      :page-size="pagesize"
      background
      layout="sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="isFieldPage ? pageSizesField : pageSizes"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-config-provider>
</template>

<style lang="scss" scoped></style>
