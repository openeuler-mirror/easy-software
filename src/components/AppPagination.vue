<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { useRoute } from 'vue-router';
import { ElPagination, ElConfigProvider } from 'element-plus';
import { COUNT_PAGESIZE, COUNT_PAGESIZE_FIELD } from '@/data/query';
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
  isFieldPage.value = route.name === 'field' || route.query?.tab === 'all';
});
</script>

<template>
  <el-config-provider :locale="isZh ? zhCn : English">
    <el-pagination
      :current-page="current"
      :page-size="pagesize"
      background
      layout="total ,sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="isFieldPage ? COUNT_PAGESIZE_FIELD : COUNT_PAGESIZE"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-config-provider>
</template>

<style lang="scss" scoped></style>
