<script lang="ts" setup>
import { OPopover, OIcon } from '@opensig/opendesign';
import IconHelp from '~icons/app/icon-help.svg';
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="install-box">
    <p class="title">
      {{ title }}
      <OPopover position="top" trigger="hover">
        <template #target>
          <OIcon ref="installRef" class="install-icon"><IconHelp /></OIcon>
        </template>
        <div class="box">
          部分欧拉镜像可能未安装config-manager 请手动执行<br />
          dnf install dnf-command(config-manager)
        </div>
      </OPopover>
    </p>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.title {
  margin: 32px 0 24px;
  @include h3;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.install-icon {
  width: 20px;
  height: 20px;
  margin-left: 8px;
}
</style>
