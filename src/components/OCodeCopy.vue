<script lang="ts" setup>
import { ref } from 'vue';

import { OIcon, useMessage } from '@opensig/opendesign';
import { useClipboard } from '@/composables/useClipboard';
import { useI18n } from 'vue-i18n';

import IconCopy from '~icons/app/icon-copy.svg';

const props = defineProps({
  code: {
    type: String,
    default: () => '',
  },
});

const { t } = useI18n();
const message = useMessage();
const codeInput = ref(props.code || '');
const copyText = (e: MouseEvent) => {
  useClipboard({
    text: codeInput.value,
    target: e,
    success: () => {
      message.success({
        content: t('software.columns.copySuccess'),
      });
    },
  });
};
</script>

<template>
  <div class="download-code">
    <div class="code">{{ codeInput }}</div>
    <OIcon @click="copyText($event)" class="copy-icon"><IconCopy /></OIcon>
  </div>
</template>

<style lang="scss" scoped>
.download-code {
  background: var(--pkg-bg);
  border-radius: var(--layout-pkg-radius);
  height: auto;
  width: 100%;
  padding: 16px 36px 16px 16px;
  @include text1;
  color: var(--o-color-primary1);
  position: relative;

  .code {
    color: var(--o-color-info2);
    font-size: 85%;
    line-height: 1.45;
  }
  .copy-icon {
    width: 24px;
    color: var(--o-color-primary1);
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    font-size: 24px;
    padding: 12px 12px 0 0;
    background-color: var(--o-color-fill1);
    transition: all var(--o-duration-m1) var(--o-easing-standard-in);
    height: 24px;
    box-sizing: content-box;
    svg {
      width: 24px;
    }
    &:hover {
      color: var(--o-color-primary1);
    }
  }
}
</style>
