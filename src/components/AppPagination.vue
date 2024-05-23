<script lang="ts" setup>
import { ref } from 'vue';
import { ElPagination, ElConfigProvider } from 'element-plus';
import { useLocale } from '@/composables/useLocale';
import { useRoute } from 'vue-router';

import zhCn from 'element-plus/es/locale/lang/zh-cn';
import English from 'element-plus/es/locale/lang/en';

const props = defineProps({
  currentPage: {
    type: Number,
    default: () => 1,
  },
  total: {
    type: Number,
    default: () => 0,
  },
  pageSize: {
    type: Number,
    default: () => 10,
  },
});

const { isZh } = useLocale();
const route = useRoute();

const emits = defineEmits<{
  (e: 'size', val: string): void;
  (e: 'current', val: string): void;
}>();

const pageSize = ref(props.pageSize || 10);
const currentPage = ref(props.currentPage);

const pageSizes = [route.name !== 'applicationsPackage' ? 12 : 10, 24, 48, 96];

const handleSizeChange = (v: number) => {
  pageSize.value = v;
  emits('size', v);
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  emits('current', val);
};
</script>

<template>
  <div class="pagination-box">
    <el-config-provider :locale="isZh ? zhCn : English">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="pageSizes"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-config-provider>
  </div>
</template>

<style lang="scss" scoped></style>
