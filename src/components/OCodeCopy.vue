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
  background: var(--o-color-fill3);
  border-radius: var(--layout-pkg-radius);
  height: auto;
  width: 100%;
  padding: 12px;
  @include tip1;
  color: var(--o-color-info1);
  position: relative;

  &:hover {
    .copy-icon {
      opacity: 1;
    }
  }
  .code {
    color: var(--o-color-info2);
  }
  .copy-icon {
    width: 24px;
    color: var(--o-color-info2);
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    font-size: 24px;
    padding: 8px 8px 0 0;
    background-color: var(--o-color-fill1);
    opacity: 0;
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
