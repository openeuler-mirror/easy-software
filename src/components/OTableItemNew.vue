<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { OTable, OLink, ODialog, OPopover } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { formatDateTime, checkOriginLink, windowOpen, xssAllTag, getPkgName } from '@/utils/common';
import { useI18n } from 'vue-i18n';

import OCodeCopy from '@/components/OCodeCopy.vue';
import ExternalLink from '@/components/ExternalLink.vue';

import IconUbuntu from '@/assets/ubuntu.png';

interface ColumnsT {
  key: string;
  label: string;
  width?: string;
  type?: string;
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
const jumpTo = (id: string) => {
  const detailType = getPkgName(props.type);
  const newHref = `/${locale.value}/${detailType}/detail?pkgId=${encodeURIComponent(id)}`;
  return newHref;
};

const showDlg = ref(false);
const codeInput = ref('');
const openDownloadDialog = (name: string, version: string, pkgId: string) => {
  const v = version ? `:${version}` : '';
  codeInput.value = `docker pull openeuler/${xssAllTag(name)}${v}`;
  showDlg.value = true;
  collectDownloadData(pkgId, name, version);
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string, name: string, version: string, pkgId?: string) => {
  externalLink.value = href;
  if (pkgId) {
    collectDownloadData(pkgId, name, version);
  }
  if (checkOriginLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};

// ---------------------下载埋点--------------------
const collectDownloadData = (pkgId: string, name: string, version: string) => {
  const sensors = (window as any)['sensorsDataAnalytic201505'];
  const { href } = window.location;
  const downloadTime = new Date();
  sensors?.setProfile({
    ...(window as any)['sensorsCustomBuriedData'],
    profileType: 'download',
    origin: href,
    softwareName: name,
    version,
    pkgId,
    type: getPkgName(props.type).toLocaleUpperCase(),
    downloadTime,
  });
};
</script>

<template>
  <div class="table-main">
    <OTable :columns="columns" :data="data" :loading="loading" border="all">
      <template #head="{ columns }">
        <th v-for="item in columns" :key="item.type" :class="item.type">{{ item.label }}</th>
      </template>
      <template #td_name="{ row }">
        <a :href="jumpTo(row.pkgId)" class="row-name max" target="_blank" rel="noopener noreferrer">
          <span v-dompurify-html="row.name" class="td-break" :title="xssAllTag(row.name)"></span>
          <template v-if="row.originPkg">
            <OPopover position="top" trigger="hover">
              <template #target>
                <img :src="IconUbuntu" ref="ubuntuRef" class="ubuntu-icon" />
              </template>
              <div class="box">ubuntu软件包名称为：{{ row.originPkg }}</div>
            </OPopover>
          </template>
        </a>
      </template>
      <template #td_version="{ row }">
        <div class="td-break max" :title="row.version">{{ row.version }}</div>
      </template>
      <template #td_appVer="{ row }">
        <div class="td-break">{{ row.appVer }}</div>
      </template>
      <template #td_arch="{ row }">
        <div class="td-break">{{ row.arch }}</div>
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

      <template #td_operation="{ row }">
        <!-- 应用镜像 -->
        <template v-if="type === 'apppkg'">
          <OLink color="primary" hover-underline @click="openDownloadDialog(row.name, row.appVer, row.pkgId)">{{ t('software.columns.download') }}</OLink>
        </template>
        <template v-else>
          <span>
            <OLink v-if="row.binDownloadUrl" @click="onExternalDialog(row.binDownloadUrl, row.name, row.appVer, row.pkgId)" color="primary" hover-underline>{{
              t('software.columns.download')
            }}</OLink>
          </span>
        </template>
      </template>
    </OTable>
    <!-- 安装下载应用镜像 -->
    <ODialog v-model:visible="showDlg" :unmount-on-hide="true" size="small" class="nss-dialog">
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
.ubuntu-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px;
}
.operation-box {
  display: grid;
  align-items: center;
  grid-template-columns: 74px auto;
  gap: 12px;
  &.apppkg {
    display: flex;
  }
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
  --table-edge-padding: 32px;
  --table-cell-padding: 16px 20px;
  --table-head-cell-padding: 12px 20px;
  --table-cell-height: 80px;
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

  .td-break {
    word-break: break-all;
  }
  .max {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    position: relative;
    word-break: break-all;
  }
  .row-name {
    display: flex;
    align-items: center;
  }
  thead {
    .name {
      width: 165px;
    }
    .tag {
      width: 200px;
    }
    .version {
      width: 138px;
    }
    .os {
      width: 180px;
    }
    .arch {
      width: 110px;
    }
    .category {
      width: 90px;
    }
    .time {
      width: 130px;
    }
    .size {
      width: 120px;
      text-align: right;
    }
    .operation {
      width: 100px;
    }
  }
}
</style>
