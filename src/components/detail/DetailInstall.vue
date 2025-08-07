<script lang="ts" setup>
import { ref } from 'vue';
import { OTab, OTabPane, OButton, useMessage, OIcon } from '@opensig/opendesign';
import { useMarkdown } from '@/composables/useMarkdown';
import { useClipboard } from '@/composables/useClipboard';
import ExternalLink from '@/components/ExternalLink.vue';
import IconCopy from '~icons/app/icon-copy.svg';

defineProps({
  title: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
});

const { mkit } = useMarkdown();
const selected = ref('online');
const message = useMessage();

type DownloadType = 'binary' | 'source_code';
const copyText = (e: MouseEvent, val: string, type: DownloadType) => {
  useClipboard({
    text: val,
    target: e,
    success: () => {
      collectDownloadData(type, true);
      message.success({
        content: '复制成功',
      });
    },
  });
};

// ---------------------下载埋点--------------------
const emit = defineEmits<{
  (event: 'reportAnalytics', data: Record<string, any>): void;
}>();
const collectDownloadData = (download_type?: DownloadType, isCopy?: boolean) => {
  const data: Record<string, string> = {
    type: isCopy ? 'copy_url' : 'download',
  };
  if (download_type) {
    data.download_type = download_type;
  }
  emit('reportAnalytics', data);
};

// ---------------------外链弹窗--------------------
const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string, type: DownloadType) => {
  externalLink.value = href;

  collectDownloadData(type);
  showExternalDlg.value = true;
};
</script>

<template>
  <p class="title">
    {{ title }}
  </p>
  <OTab v-model="selected" variant="text" :line="false" class="domain-tabs" :class="options.length > 1 ? 'tabs-switch' : 'tabs-one'">
    <template v-for="item in options" :key="item.type">
      <OTabPane class="tab-pane" :label="item.name" :value="item.type">
        <template v-if="item.type === 'online'">
          <div
            v-copy-installation
            v-dompurify-html="mkit(item.installation, { isCopy: true, Tag: item.appVer })"
            v-copy-code="true"
            class="markdown-body download"
          ></div>
        </template>
        <div v-if="item.type === 'download'">
          <p class="download-size">软件包大小：{{ item.size }}</p>
          <div class="download-box">
            <template v-for="sub in item.children" :key="sub.type">
              <div v-if="sub.href" class="download-item">
                <OButton variant="solid" class="obtn" size="large" @click="onExternalDialog(sub.href, sub.type)">{{ sub.label }}</OButton>
                <p @click="copyText($event, sub.href, sub.type)" class="copy-icon">
                  <OIcon><IconCopy /></OIcon>
                </p>
              </div>
            </template>
          </div>
        </div>
      </OTabPane>
    </template>
  </OTab>
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
.title {
  margin: 32px 0 24px;
  color: var(--o-color-info1);
  font-weight: 500;
  @include h3;
}
.download-box {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 12px;
}
.download-size {
  @include text1;
  color: var(--o-color-info2);
}

.obtn {
  background: var(--o-color-control2-light);
  border: none;
  transition: none;
  --btn-color: var(--o-color-info1);
  &:hover {
    background: var(--o-color-control3-light);
  }
}
.download-item {
  height: 100%;
  display: flex;
  margin-bottom: 24px;
  align-items: center;

  button {
    width: 240px;
  }
  .copy-icon {
    margin-left: 16px;
    cursor: pointer;

    .o-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--o-color-link1);
      &:hover {
        color: var(--o-color-link2);
      }
    }
  }
  p {
    height: 40px;
    display: flex;
    align-items: center;
  }
}
</style>
