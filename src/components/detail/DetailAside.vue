<script lang="ts" setup>
import { OTable, OTag, OIcon, OLink } from '@opensig/opendesign';

import { ref, computed, watch, type PropType } from 'vue';
import ExternalLink from '@/components/ExternalLink.vue';
import MaintenanceDescription from '@/components/detail/MaintenanceDescription.vue';
import DetailBasicInfo from '@/components/detail/DetailBasicInfo.vue';
import { checkOriginLink, windowOpen } from '@/utils/common';
import type { MaintainerT } from '@/@types/app';
import { verColumns } from '@/data/detail/index';
import { useLocale } from '@/composables/useLocale';
import type { PkgTypeT } from '@/@types/app';
import { useI18n } from 'vue-i18n';
import { ATOMGIT, GITEE } from '@/data/config';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconState from '~icons/pkg/icon-state.svg';
import IconLevel from '~icons/pkg/icon-level.svg';
import IconEmail from '~icons/pkg/email.svg';
import IconGitee from '~icons/pkg/gitee.svg';

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
  maintainer: {
    type: Object as PropType<MaintainerT>,
    default: () => {
      return {};
    },
  },
});
const { t } = useI18n();

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  if (checkOriginLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
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

const isSecurityShow = ref(false);
// 是否显示图标
const isSecurityIconShow = (v: string) => {
  return ['L1', 'L2', 'L3', 'L4'].includes(v);
};
</script>

<template>
  <!-- 维护者信息 -->
  <AppSection title="维护者信息">
    <div class="maintainer-box">
      <p v-if="maintainer.maintainerId" class="title">维护者：{{ maintainer.maintainerId }}</p>
      <p v-if="maintainer.maintainerEmail" class="text">
        <a class="email" :href="`mailto:${maintainer.maintainerEmail}`">
          <OIcon class="icon-img"><IconEmail /></OIcon>
          <span>{{ maintainer.maintainerEmail }}</span>
        </a>
      </p>
      <p v-if="maintainer.maintainerGiteeId" class="text">
        <a class="warehouse" @click="onExternalDialog(`${GITEE}/${maintainer.maintainerGiteeId}`)">
          <OIcon class="icon-img"><IconGitee /></OIcon>
          <span>{{ `${GITEE}/${maintainer.maintainerGiteeId}` }}</span>
        </a>
      </p>
    </div>
  </AppSection>
  <!-- 软件合规 -->
  <AppSection title="基础信息">
    <DetailBasicInfo />
  </AppSection>
  <!-- 软件分级 -->
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
  <!-- 软件合规 -->
  <AppSection title="软件合规" v-if="data.license">
    <div class="license">
      <p>License</p>
      <p>{{ data.license }}</p>
    </div>
  </AppSection>
  <!-- 版本支持情况 -->
  <AppSection v-if="verData.length > 0 && type !== 'IMAGE'" :line="false" :title="`${data.name}版本支持情况`">
    <OTable class="table-versions" :columns="verColumns" :data="tableAllData" border="all" :cell-span="arraySpanMethod" :small="true">
      <template #td_flags="{ row }">
        <a :href="jumpTo(row.pkgId)" color="primary" rel="noopener noreferrer">
          <OTag v-if="row.os === tagVer[0] && row.arch === tagVer[1]" color="primary" :size="'small'">当前版本</OTag> <span v-else>查看</span>
        </a>
      </template>
      <template #td_arch="{ row }">
        <template v-if="row.arch">{{ row.arch }}</template>
        <template v-else>-</template>
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
  <!-- 外链确认 -->
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
.maintainer-box {
  p {
    display: flex;
    align-items: center;
    color: var(--o-color-info1);
  }
  .title {
    margin-bottom: 16px;
  }
  .text {
    margin-top: 8px;
    a {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

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
  padding: 32px;
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
</style>
