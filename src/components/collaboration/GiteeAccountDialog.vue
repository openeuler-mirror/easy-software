<script lang="ts" setup>
import { ref } from 'vue';
import { ODialog, OButton } from '@opensig/opendesign';
import { windowOpen } from '@/utils/common';

const showGiteeDlg = ref(true);

const emits = defineEmits<{
  (e: 'close'): void;
}>();

// 跳转个人中心绑定账号
const USER_CENTER = import.meta.env.VITE_LOGIN_URL;
const jumpAccount = () => {
  showGiteeDlg.value = false;
  emits('close');
  windowOpen(USER_CENTER);
};
const onChange = () => {
  emits('close');
};
</script>

<template>
  <ODialog v-model:visible="showGiteeDlg" class="revoke-dlg" :unmount-on-hide="true" :mask="true" size="small" @change="onChange">
    <template #header>
      <p class="title">绑定账号</p>
    </template>
    <p class="revoke-text">想要获取相关信息，请先前往个人中心-账号绑定 绑定您的Gitee账号</p>
    <template #footer>
      <div class="dlg-action">
        <OButton variant="solid" size="large" color="primary" class="upload" @click="jumpAccount">前往绑定</OButton>
        <OButton variant="outline" size="large" color="primary" class="upload" @click="showGiteeDlg = false">取消</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.dlg-action {
  display: flex;
  justify-content: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
}
</style>
