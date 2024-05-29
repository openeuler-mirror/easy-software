<script lang="ts" setup>
import { OTable, useMessage, OButton, OTag, OIcon } from '@opensig/opendesign';
import OCodeCopy from '@/components/OCodeCopy.vue';
import { ref, computed, watch, type PropType } from 'vue';
import ExternalLink from '@/components/ExternalLink.vue';
import { useClipboard } from '@/composables/useClipboard';
import { getCode } from '@/utils/common';
import { verColumns } from '@/data/detail/index';
import IconCopy from '~icons/app/icon-copy.svg';
import { useLocale } from '@/composables/useLocale';
import type { PkgTypeT } from '@/@types/app';
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  maintainer: {
    type: Object,
    default: () => {
      return {};
    },
  },
  basicInfo: {
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
  allShow: {
    default: () => {
      return false;
    },
  },
  verData: {
    default: () => {
      return [];
    },
  },
  license: {
    default: () => {
      return '';
    },
  },
  tagVer: {
    default: () => {
      return [];
    },
  },
});

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
      message.success({
        content: '复制成功',
      });
    },
  });
};
//合并单元格
const arraySpanMethod = (rowIndex: number, colIdx: number, row: any, column: any) => {
  const fields = ['os'];
  const cellValue = row[column.key];
  if (cellValue && fields.includes(column.key)) {
    const prevRow = props.verData[rowIndex - 1];
    let nextRow = props.verData[rowIndex + 1];

    if (prevRow && prevRow[column.key] === cellValue) {
      return { rowspan: 0, colspan: 0 };
    } else {
      let countRowspan = 1;
      while (nextRow && nextRow[column.key] === cellValue) {
        nextRow = props.verData[++countRowspan + rowIndex];
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
    const detailType = props.type === 'IMAGE' ? 'image' : props.type === 'RPM' ? 'package' : 'epkg';
    const newHref = `/${locale.value}/${detailType}/detail?pkgId=${encodeURIComponent(id)}`;
    return newHref;
  }
};
</script>

<template>
  <AppSection :title="type === 'IMAGE' ? '获取容器镜像' : `${type}下载安装`" v-if="type === 'IMAGE' || data.size !== 0">
    <div class="detail">
      <p class="title" v-if="type !== 'IMAGE'">软件包大小：{{ data.size }}</p>
    </div>
    <OCodeCopy :code="getCode(downloadData)" v-if="type === 'IMAGE' && downloadData" />
    <div v-if="type !== 'IMAGE' && show">
      <div v-for="item in tableData" :key="item.name" class="bt">
        <OButton variant="solid" color="primary" size="large" @click="onExternalDialog(item.download)">{{ item.name }}</OButton>
        <p @click="copyText($event, item.download)" class="copy-icon">
          <OIcon><IconCopy /></OIcon>
        </p>
      </div>
    </div>
  </AppSection>
  <AppSection title="软件合规" v-if="license">
    <div class="license">
      <p>License</p>
      <p>{{ license }}</p>
    </div>
  </AppSection>
  <AppSection :title="`${data.name}版本支持情况`">
    <OTable :columns="verColumns" :data="verData" border="all" :cell-span="arraySpanMethod" :small="true">
      <template #td_flags="{ row }">
        <a :href="jumpTo(row.pkgId)" color="primary" rel="noopener noreferrer">
          <OTag v-if="row.os === tagVer[0] && row.arch === tagVer[1]" color="primary" :size="'small'">当前版本</OTag> <span v-else>查看</span></a
        >
      </template>
    </OTable>
  </AppSection>

  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
.app-section {
  padding: 32px 40px;
}
.detail {
  margin: 0 0 24px;
}
.sp {
  margin-right: 20px;
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
  border-top: 1px rgba(0, 0, 0, 0.1) solid;
  padding-top: 25px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 24px;
}
:deep(.o-table) {
  th,
  td {
    padding: 2px 12px;
    font-size: 14px !important;
  }
  tbody tr:hover {
    background: none;
  }
  th {
    font-weight: 500;
  }
}
</style>
