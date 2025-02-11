<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { OTable, OLink, ODialog, OPopover, OTag } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { formatDateTime, checkOriginLink, windowOpen, xssAllTag, getPkgName } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import { SORTPARAMS } from '@/data/query';
import { oaReport } from '@/shared/analytics';

import OCodeCopy from '@/components/OCodeCopy.vue';
import ExternalLink from '@/components/ExternalLink.vue';

import IconUbuntu from '@/assets/ubuntu.png';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { computed } from 'vue';

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

const route = useRoute();
const { t } = useI18n();
const { locale } = useLocale();
const jumpTo = (id: string) => {
  const detailType = getPkgName(props.type);
  const newHref = `/${locale.value}/${detailType}/detail?pkgId=${encodeURIComponent(id)}`;
  return newHref;
};

const isPageSearch = computed(() => route.name === 'search');

const reportAnalytics = (data: Record<string, any>, event = 'click') => {
  if (isPageSearch.value) {
    oaReport(
      event,
      {
        module: 'search_page',
        tab: route.query.tab ?? '',
        ...data,
      },
      'search_portal'
    );
    return;
  }
  oaReport(event, {
    module: route.name,
    ...data,
  });
};

const showDlg = ref(false);
const codeInput = ref('');
let copyCmdAppInfo: any;

watch(showDlg, (val) => {
  if (!val && copyCmdAppInfo) {
    copyCmdAppInfo = null;
  }
});

const openDownloadDialog = (row: any) => {
  const v = row.appVer ? `:${row.appVer}` : '';
  codeInput.value = `docker pull openeuler/${xssAllTag(row.name)}${v}`;
  showDlg.value = true;
  copyCmdAppInfo = { ...row };
  collectDownloadData(row);
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (row: any) => {
  externalLink.value = row.binDownloadUrl;
  if (row.pkgId) {
    collectDownloadData(row);
  }
  if (checkOriginLink(row.binDownloadUrl)) {
    windowOpen(row.binDownloadUrl, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};

// ---------------------下载埋点--------------------
const collectDownloadData = (row: any) => {
  reportAnalytics({
    type: 'download',
    app_name: xssAllTag(row.name),
    version: row.appVer || row.version,
    os_version: row.os,
    architecture: row.arch,
  });
};

const onCopySuccess = () => {
  if (!copyCmdAppInfo) return;
  reportAnalytics({
    type: 'cmd_copy',
    app_name: xssAllTag(copyCmdAppInfo.name),
    version: copyCmdAppInfo.appVer,
    os_version: copyCmdAppInfo.os,
    architecture: copyCmdAppInfo.arch,
  });
};

// 表格筛选
const emits = defineEmits<{
  (e: 'sort', value: string[]): void;
}>();
const timeIndex = ref(0);
const nameIndex = ref(0);

const changeSortBy = (type: string) => {
  const updateIndex = (index) => {
    if (index.value >= 2) {
      index.value = 0;
    } else {
      index.value++;
    }
  };

  if (type === 'name') {
    updateIndex(nameIndex);
    emits('sort', ['name', nameIndex.value]);
  } else if (type === 'rpmUpdateAt') {
    updateIndex(timeIndex);
    emits('sort', ['time', timeIndex.value]);
  } else {
    return;
  }
};

const onClickLink = (row: any) => {
  reportAnalytics({
    type: isPageSearch.value ? 'search_content' : 'go_detail',
    app_name: xssAllTag(row.name),
    version: row.appVer || row.version,
    os_version: row.os,
    architecture: row.arch,
  });
};
</script>

<template>
  <div class="table-main">
    <OTable :columns="columns" :data="data" :loading="loading" :small="true" border="row-frame" :class="type">
      <template #head="{ columns }">
        <th v-for="item in columns" :key="item.type" :class="item.type">
          <template v-if="item.key === 'name' || item.key === 'rpmUpdateAt'">
            <div v-if="item.key === 'name'" @click="changeSortBy('name')" class="thead-th sort">
              {{ item.label }}
              <span class="order" :class="SORTPARAMS[nameIndex]"></span>
            </div>
            <div v-if="item.key === 'rpmUpdateAt'" @click="changeSortBy(item.key)" class="thead-th sort">
              {{ item.label }}
              <span class="order" :class="SORTPARAMS[timeIndex]"></span>
            </div>
          </template>
          <div v-else class="thead-th">{{ item.label }}</div>
        </th>
      </template>
      <template #td_name="{ row }">
        <span v-if="type === 'appversion'" v-dompurify-html="row.name"></span>
        <a v-else :href="jumpTo(row.pkgId)" @click="onClickLink(row)" class="row-name max" target="_blank" rel="noopener">
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
        <div class="label">
          {{ column.label }}
        </div>
      </template>
      <template #td_rpmSize="{ row }">
        <p class="size">{{ row.rpmSize }}</p>
      </template>
      <!-- epkg size -->
      <template #th_epkgSize="{ column }">
        <div class="label">
          {{ column.label }}
        </div>
      </template>
      <template #td_epkgSize="{ row }">
        <p class="size">{{ row.epkgSize }}</p>
      </template>
      <template #td_upstreamVersion="{ row }">
        {{ row.upstreamVersion }}
      </template>
      <template #td_compatibleVersion="{ row }">
        {{ row.compatibleVersion }}
      </template>
      <template #td_status="{ row }">
        <OTag v-if="row.status" class="app-tag" :class="row.status.toLocaleLowerCase()">{{ row.status }} </OTag>
        <template v-else>-</template>
      </template>
      <template #td_subPath="{ row }">
        <template v-if="row.subPath">{{ row.subPath }}</template>
        <template v-else>-</template>
      </template>
      <template #td_operation="{ row }">
        <!-- 应用镜像 -->
        <template v-if="type === 'apppkg'">
          <OLink color="primary" hover-underline @click="openDownloadDialog(row)">{{ t('software.columns.download') }}</OLink>
        </template>
        <template v-else>
          <span>
            <OLink v-if="row.binDownloadUrl" @click="onExternalDialog(row)" color="primary" hover-underline>{{ t('software.columns.download') }}</OLink>
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
        <OCodeCopy :code="codeInput" @success="onCopySuccess" />
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

.app-tag {
  min-width: 92px;
  color: var(--o-color-white);
  &.outdated {
    --tag-bg-color: #058ef0;
    --tag-bd-color: #058ef0;
  }
  &.ok {
    --tag-bg-color: #0bb151;
    --tag-bd-color: #0bb151;
  }
  &.missing {
    --tag-bg-color: #c7000b;
    --tag-bd-color: #c7000b;
  }
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
  --table-cell-height: 62px;
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
  td {
    vertical-align: top;
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
  &.oepkg {
    --table-cell-height: auto;
    thead {
      .name {
        width: 200px;
      }
      .os {
        width: 160px;
      }
      .version {
        width: 100px;
      }
    }
  }
  &.apppkg {
    --table-cell-height: auto;
    thead {
      .os {
        width: 180px;
      }
      .arch,
      .category {
        width: 100px;
      }
    }
  }
  &.appversion {
    --table-cell-height: auto;
  }
  thead {
    .order {
      height: 12px;
      width: 8px;
      position: relative;
      margin-left: 8px;
      color: var(--o-color-control1);

      &:after,
      &:before {
        content: '';
        position: absolute;
        border: 6px solid transparent;
        border-width: 5px 4px;
        left: 0;
        color: #a0a2a8;
      }

      &:before {
        border-bottom-color: currentColor;
        top: -5px;
      }

      &:after {
        border-top-color: currentColor;
        top: 7px;
      }
      &.asc:before,
      &.desc:after {
        color: var(--o-color-info1);
      }
    }
    .thead-th {
      display: flex;
      align-items: center;
      &.sort {
        cursor: pointer;
      }
    }
    .name {
      width: 200px;
    }
    .tag {
      width: 200px;
    }
    .version {
      width: 115px;
    }
    .os {
      width: 108px;
    }
    .arch {
      width: 80px;
    }
    .category {
      width: 80px;
    }
    .time {
      width: 90px;
    }
    .sub-path {
      width: 160px;
    }
    .size {
      width: 80px;
    }
    .operation {
      width: 60px;
    }
  }
}
</style>
