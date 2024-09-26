<script lang="ts" setup>
import { ref, computed } from 'vue';
import { OTable, ODialog } from '@opensig/opendesign';
import { securityTypes } from '@/data/todo/';

const securityColumns = [
  { label: '软件包维护级别', key: 'id' },
  { label: '描述', key: 'children' },
];

const showDlg = ref(true);
const emits = defineEmits<{
  (e: 'change'): void;
}>();

const closeDlg = () => {
  showDlg.value = false;
  emits('change');
};
</script>

<template>
  <ODialog
    v-model:visible="showDlg"
    :unmount-on-hide="true"
    :mask="true"
    size="large"
    :style="{
      '--dlg-width': '1170px',
    }"
    @change="closeDlg"
  >
    <template #header>
      <p class="title">软件维护信息说明</p>
    </template>

    <OTable class="main-table" :columns="securityColumns" :data="securityTypes" border="all" :small="true">
      <template #td_children="{ row }">
        <p v-for="(item, index) in row.children" :key="item">
          <template v-if="index === 0"
            >{{ item }}<strong>{{ row.label }}</strong></template
          >
          <template v-else>{{ item }}</template>
        </p>
      </template>
    </OTable>
  </ODialog>
</template>

<style lang="scss" scoped></style>
