<script lang="ts" setup>
import type { PropType } from 'vue';
import { ref } from 'vue';
import { OTable, OLink, ODialog, OIcon } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { formatDateTime, checkDomainLink, windowOpen, xssAllTag } from '@/utils/common';
import { useI18n } from 'vue-i18n';

import OCodeCopy from '@/components/OCodeCopy.vue';
import ExternalLink from '@/components/ExternalLink.vue';

import IconOutlink from '~icons/pkg/icon-outlink.svg';

interface ColumnsT {
  key: string;
  label: string;
  width?: string;
}

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: () => 'all',
  },
  columns: {
    type: Array as PropType<ColumnsT[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: () => false,
  },
});

const { t } = useI18n();
const { locale } = useLocale();
const jumpTo = (name: string, id: string) => {
  const type = props.type === 'apppkg' ? 'image' : props.type === 'rpmpkg' ? 'RPM' : 'EPKG';
  const detailType = props.type === 'apppkg' ? 'image' : props.type === 'rpmpkg' ? 'package' : 'epkg';
  const newHref = `/${locale.value}/${detailType}/${xssAllTag(name)}?type=${type}&pkgId=${id}`;
  return newHref;
};

const showDlg = ref(false);
const codeInput = ref('');
const openDownloadDialog = (name: string, version: string) => {
  const v = version ? `:${version}` : '';
  codeInput.value = `docker pull openeuler/${xssAllTag(name)}${v}`;
  showDlg.value = true;
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  if (checkDomainLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};
</script>

<template>
  <div class="table-main">
    <OTable :columns="columns" :data="data" :loading="loading" border="row-column">
      <template #head="{ columns }">
        <th v-for="item in columns" :key="item.key" :class="item.key">{{ item.label }}</th>
      </template>
      <template #td_name="{ row }">
        <a :href="jumpTo(row.name, row.pkgId)" color="primary" target="_blank" rel="noopener noreferrer"><span v-dompurify-html="row.name"></span></a>
      </template>
      <template #td_epkgUpdateAt="{ row }">
        {{ formatDateTime(row.epkgUpdateAt) }}
      </template>
      <template #td_rpmUpdateAt="{ row }">
        {{ formatDateTime(row.rpmUpdateAt) }}
      </template>
      <!-- rpm size -->
      <template #th_rpmSize="{ column }">
        <div class="label" style="justify-content: right">
          {{ column.label }}
        </div>
      </template>
      <template #td_rpmSize="{ row }">
        <p class="size" style="text-align: right">{{ row.rpmSize }}</p>
      </template>
      <!-- epkg size -->
      <template #th_epkgSize="{ column }">
        <div class="label" style="justify-content: right">
          {{ column.label }}
        </div>
      </template>
      <template #td_epkgSize="{ row }">
        <p class="size" style="text-align: right">{{ row.epkgSize }}</p>
      </template>
      <template #td_dockerStr="{ row }">
        <div class="docker"><OCodeCopy :code="row.dockerStr" /></div>
      </template>
      <template #td_operation="{ row }">
        <div class="operation-box">
          <!-- 容器镜像 -->
          <template v-if="props.type === 'apppkg'">
            <OLink color="primary" hover-underline @click="openDownloadDialog(row.name, row.appVer)">{{ t('software.columns.download') }}</OLink>
          </template>
          <template v-else>
            <OLink v-if="row.srcRepo" @click="onExternalDialog(row.srcRepo)" class="code-repo" color="primary" hover-underline>
              {{ t('software.columns.repository') }}
              <template #suffix
                ><OIcon><IconOutlink /></OIcon
              ></template>
            </OLink>
            <OLink v-if="row.binDownloadUrl" @click="onExternalDialog(row.binDownloadUrl)" color="primary" hover-underline>{{
              t('software.columns.download')
            }}</OLink>
          </template>
        </div>
      </template>
    </OTable>
    <!-- 安装下载容器镜像 -->
    <ODialog v-model:visible="showDlg" :unmount-on-hide="true" size="medium" :hide-close="true" class="nss-dialog">
      <template #header>
        <p class="feedback-title">{{ t('software.installImage.title') }}</p>
      </template>
      <div class="apppkg-download">
        <p class="text">{{ t('software.installImage.text') }}</p>
        <OCodeCopy :code="codeInput" />
      </div>
    </ODialog>
    <!-- 跳转外部链接提示 -->
    <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
  </div>
</template>

<style lang="scss" scoped>
.operation-box {
  display: flex;
  align-items: center;
  gap: 12px;

  .code-repo {
    svg {
      width: 16px;
      color: currentColor;
    }
  }
}
.docker {
  .download-code {
    min-height: 48px;
  }
}
.apppkg-download {
  .text {
    @include text1;
    color: var(--o-color-info1);
    margin-bottom: 8px;
  }
  :deep(.o-input) {
    width: 100%;
    .o-input-suffix-wrap {
      display: flex;
      align-items: center;
    }
  }
}

:deep(.o-table) {
  --table-edge-padding: 16px;
  --table-cell-padding: 12px 16px;
  --table-head-cell-padding: 12px 16px;

  .label {
    display: flex;
    align-items: center;
    .icon-filter {
      cursor: pointer;
      svg {
        fill: currentColor;
        color: var(--o-color-info3);
        width: 20px;
        margin-left: 3px;
      }
    }
    .icon-time-order {
      margin-left: 4px;
      cursor: pointer;
      svg {
        fill: currentColor;
        color: var(--o-color-info3);
        width: 24px;
      }
      &.on {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
