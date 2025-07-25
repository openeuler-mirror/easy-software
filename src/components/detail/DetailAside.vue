<script lang="ts" setup>
import { OTable, useMessage, OButton, OTag, OIcon, OLink } from '@opensig/opendesign';
import OCodeCopy from '@/components/OCodeCopy.vue';
import { ref, computed, watch, type PropType } from 'vue';
import ExternalLink from '@/components/ExternalLink.vue';
import MaintenanceDescription from '@/components/detail/MaintenanceDescription.vue';
import { useClipboard } from '@/composables/useClipboard';
import { getCode } from '@/utils/common';
import { verColumns } from '@/data/detail/index';
import IconCopy from '~icons/app/icon-copy.svg';
import { useLocale } from '@/composables/useLocale';
import type { PkgTypeT } from '@/@types/app';
import { useI18n } from 'vue-i18n';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconState from '~icons/pkg/icon-state.svg';
import IconLevel from '~icons/pkg/icon-level.svg';

interface EulerverT {
  pkgId: string;
  os: string;
  arch: string;
}

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  type: {
    type: String as PropType<PkgTypeT>,
    default: () => {
      return 'RPM';
    },
  },
  downloadData: {
    default: () => {
      return '';
    },
  },
  verData: {
    type: Array as PropType<EulerverT[]>,
    default: () => {
      return [];
    },
  },
  tagVer: {
    default: () => {
      return [];
    },
  },
});
const { t } = useI18n();

const emit = defineEmits<{
  (event: 'reportAnalytics', data: Record<string, any>): void;
}>();

const tableData = ref([
  {
    name: '二进制包下载',
    download: computed(() => props.data.bin_code),
  },
  {
    name: '源码包下载',
    download: computed(() => props.data.source_code),
  },
]);
const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;

  collectDownloadData(href === props.data.bin_code ? 'binary' : 'source_code');
  showExternalDlg.value = true;
};
const show = ref(true);
const showTable = () => {
  if (!props.data.bin_code && !props.data.source_code) {
    tableData.value = [];
    show.value = false;
  } else if (!props.data.bin_code) {
    tableData.value = [
      {
        name: '源码包下载',
        download: computed(() => props.data.source_code),
      },
    ];
    show.value = true;
  } else if (!props.data.source_code) {
    tableData.value = [
      {
        name: '二进制包下载',
        download: computed(() => props.data.bin_code),
      },
    ];
    show.value = true;
  } else {
    tableData.value = [
      {
        name: '二进制包下载',
        download: computed(() => props.data.bin_code),
      },
      {
        name: '源码包下载',
        download: computed(() => props.data.source_code),
      },
    ];
    show.value = true;
  }
};
watch(
  () => props.data.bin_code,
  () => showTable()
);
showTable();

const message = useMessage();
const copyText = (e: MouseEvent, val: any) => {
  useClipboard({
    text: val,
    target: e,
    success: () => {
      collectDownloadData(val === props.data.bin_code ? 'binary' : 'source_code', true);
      message.success({
        content: '复制成功',
      });
    },
  });
};

// ---------------------下载埋点--------------------
const collectDownloadData = (download_type?: 'binary' | 'source_code' | null, isCopy?: boolean) => {
  const data: Record<string, string> = {
    type: isCopy ? 'copy_url' : 'download',
  };
  if (download_type) {
    data.download_type = download_type;
  }
  emit('reportAnalytics', data);
};

// ---------------------版本支持情况--------------------
const versionData = ref<EulerverT[]>(props.verData || []);

interface ColumnT {
  key: string;
  label: string;
}
//版本支持情况合并单元格
const arraySpanMethod = (rowIndex: number, colIdx: number, row: EulerverT, column: ColumnT) => {
  const fields = ['os'];
  const cellValue = row[column.key];
  if (cellValue && fields.includes(column.key)) {
    const prevRow = versionData.value[rowIndex - 1];
    let nextRow = versionData.value[rowIndex + 1];

    if (prevRow && prevRow[column.key] === cellValue) {
      return { rowspan: 0, colspan: 0 };
    } else {
      let countRowspan = 1;
      while (nextRow && nextRow[column.key] === cellValue) {
        nextRow = versionData.value[++countRowspan + rowIndex];
      }
      if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 };
      }
    }
  }
};

const { locale } = useLocale();
const jumpTo = (id: string) => {
  if (props.type) {
    const newHref = `/${locale.value}/${props.type.toLocaleLowerCase()}/detail?pkgId=${encodeURIComponent(id)}`;
    return newHref;
  }
};

const isToggle = ref(false);
const tableLen = ref(10);
const tableAllData = computed(() => {
  let tableVerData = [];
  if (isToggle.value && versionData.value.length > tableLen.value) {
    tableVerData = versionData.value;
  } else {
    tableVerData = versionData.value.slice(0, tableLen.value);
  }
  return tableVerData;
});
const showMore = () => {
  isToggle.value = !isToggle.value;
};

watch(
  () => props.verData,
  () => {
    versionData.value = props.verData;
    // 处理当前版本在最前面
    versionData.value.forEach((item, index) => {
      if (item.os === props.tagVer[0]) {
        versionData.value.splice(index, 1);
        versionData.value.unshift(item);
      }
    });
  }
);

// 应用镜像埋点
const onCodeSuccess = () => {
  collectDownloadData(null, true);
};

const isSecurityShow = ref(false);
// 是否显示图标
const isSecurityIconShow = (v: string) => {
  return ['L1', 'L2', 'L3', 'L4'].includes(v);
};
</script>

<template>
  <AppSection :title="type === 'IMAGE' ? '获取应用镜像' : `${type}下载安装`" v-if="type === 'IMAGE' || data.size !== 0">
    <div class="detail">
      <p class="title" v-if="type !== 'IMAGE'">软件包大小：{{ data.size }}</p>
    </div>
    <OCodeCopy :code="getCode(downloadData)" v-if="type === 'IMAGE' && downloadData" @success="onCodeSuccess" />
    <div v-if="type !== 'IMAGE' && show">
      <div v-for="item in tableData" :key="item.name" class="bt">
        <OButton variant="solid" class="obtn" size="large" @click="onExternalDialog(item.download)">{{ item.name }}</OButton>
        <p @click="copyText($event, item.download)" class="copy-icon">
          <OIcon><IconCopy /></OIcon>
        </p>
      </div>
    </div>
  </AppSection>
  <AppSection title="软件分级" v-if="data.security">
    <template #append>
      <div @click="isSecurityShow = true" class="security-info">
        <OIcon><IconState /></OIcon>说明
      </div>
    </template>
    <div class="license">
      <p>等级</p>
      <p class="level-info">
        <OIcon v-if="isSecurityIconShow(data.security)" class="icon-level"><IconLevel /></OIcon>{{ data.security }}
      </p>
    </div>
    <MaintenanceDescription v-if="isSecurityShow" @change="isSecurityShow = false" />
  </AppSection>
  <AppSection title="软件合规" v-if="data.license">
    <div class="license">
      <p>License</p>
      <p>{{ data.license }}</p>
    </div>
  </AppSection>
  <AppSection v-if="verData.length > 0" :title="`${data.name}版本支持情况`">
    <OTable class="table-versions" :columns="verColumns" :data="tableAllData" border="all" :cell-span="arraySpanMethod" :small="true">
      <template #td_flags="{ row }">
        <a :href="jumpTo(row.pkgId)" color="primary" rel="noopener noreferrer">
          <OTag v-if="row.os === tagVer[0] && row.arch === tagVer[1]" color="primary" :size="'small'">当前版本</OTag> <span v-else>查看</span>
        </a>
      </template>
    </OTable>
    <p v-if="tableAllData.length >= tableLen" class="view-all">
      <OLink color="primary" :class="isToggle ? 'up' : 'down'" @click="showMore" size="small">
        {{ isToggle ? t('software.upList') : t('software.viewAll') }}
        <template #suffix>
          <OIcon><IconChevronDown /></OIcon>
        </template>
      </OLink>
    </p>
  </AppSection>

  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
.level-info {
  display: flex;
  align-items: center;
  .icon-level {
    width: 20px;
    height: 20px;
    color: var(--o-color-primary1);
    margin-right: 8px;
    svg {
      width: 20px;
      height: 20px;
    }
  }
}
.security-info {
  display: flex;
  align-items: center;
  color: var(--o-color-info1);
  cursor: pointer;
  @include tip2;
  svg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
}
.app-section {
  padding: 32px 40px;
}
.view-all {
  text-align: center;
  margin-top: 12px;
  .o-link-small {
    @include tip2;
  }
  svg {
    color: var(--o-color-primary1);
    transition: 0.3s ease-in-out;
  }
  .up svg {
    transform: rotate(180deg);
  }
}

.detail {
  margin: 0 0 24px;
  color: var(--o-color-info1);
}
.bt {
  height: 100%;
  display: flex;
  margin-bottom: 24px;
  align-items: center;

  button {
    width: 240px;
  }
  .copy-icon {
    margin-left: 24px;
    cursor: pointer;

    .o-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--o-color-primary1);
    }
  }
  p {
    height: 40px;
    display: flex;
    align-items: center;
  }
}
.license {
  border-top: 1px solid var(--o-color-control4);
  padding-top: 25px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--o-color-info1);
  p + p {
    margin-left: 24px;
  }
}
:deep(.o-table) {
  --table-edge-padding: var(--table-cell-padding);

  .o-table-wrap {
    border-bottom: 0 none;
    tr.last td {
      border-bottom: var(--table-border);
    }
  }
  tbody tr:hover {
    background: none;
  }
  th {
    font-weight: 500;
  }
}

.obtn {
  border-radius: 4px;
  background: var(--o-color-control2-light);
  border: none;
  transition: none;
  --btn-color: var(--o-color-info1);
  &:hover {
    background: var(--o-color-control3-light);
  }
}
</style>
