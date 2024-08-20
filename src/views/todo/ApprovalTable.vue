<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { OTable, OLink, OTag } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '@/utils/common';
import { useRouter, useRoute } from 'vue-router';
import { applyStatus } from '@/data/todo';

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
    default: () => '',
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
const router = useRouter();
const route = useRoute();
const { locale } = useLocale();
const jumpTo = (id: number) => {
  const type = route.params?.type as string;
  router.push({
    path: `/${locale.value}/todo/${type}/${id}`,
  });
};

const emits = defineEmits<{
  (e: 'revoke', id: number): void;
}>();

const revokeApplication = (id: number) => {
  emits('revoke', id);
};
</script>

<template>
  <div class="table-main" :class="type">
    <OTable :columns="columns" :data="data" :loading="loading" border="all">
      <template #head="{ columns }">
        <th v-for="item in columns" :key="item.type" :class="item.type">{{ item.label }}</th>
      </template>
      <template #td_updateAt="{ row }">
        {{ formatDateTime(row.updateAt) }}
      </template>
      <template #td_applyStatus="{ row }">
        <OTag v-if="row.applyStatus" class="app-tag" :class="row.applyStatus?.toLocaleLowerCase()">{{ applyStatus[row.applyStatus] }} </OTag>
      </template>
      <template #td_operation="{ row }">
        <template v-if="type === 'application'">
          <div class="oper-box">
            <OLink color="primary" hover-underline @click="jumpTo(row.applyId)">申请详情</OLink>
            <OLink color="danger" hover-underline @click="revokeApplication(row.applyId)">撤销申请</OLink>
          </div>
        </template>
        <template v-if="type === 'approval'">
          <OLink color="primary" hover-underline @click="jumpTo(row.applyId)">审批</OLink>
        </template>
        <template v-if="type === 'approved'">
          <OLink color="primary" hover-underline @click="jumpTo(row.applyId)">审批详情</OLink>
        </template>
      </template>
    </OTable>
  </div>
</template>

<style lang="scss" scoped>
.oper-box {
  display: flex;
  align-items: center;
  .o-link + .o-link {
    margin-left: 24px;
  }
}

.app-tag {
  min-width: 72px;
  color: var(--o-color-white);
  &.pendding {
    --tag-bg-color: var(--o-color-warning1);
    --tag-bd-color: var(--o-color-warning1);
  }
  &.passed {
    --tag-bg-color: var(--o-color-success1);
    --tag-bd-color: var(--o-color-success1);
  }
  &.revoked {
    --tag-bg-color: var(--o-color-control1);
    --tag-bd-color: transparent;
  }

  &.dismissed {
    --tag-bg-color: var(--o-color-danger1);
    --tag-bd-color: var(--o-color-danger1);
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
}
thead {
  .repo {
    width: 180px;
  }
  .metric,
  .metricStatus,
  .description {
    width: 150px;
  }
  .applyStatus,
  .adminstrator,
  .applyId {
    width: 120px;
  }

  .maintainer {
    width: 180px;
  }
  .updateAt {
    width: 130px;
  }
  .operation {
    width: 220px;
  }
}
.application {
  :deep(.o-table) {
    @mixin liner {
      content: '';
      box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.15);
      height: 100%;
      position: absolute;
      top: 0;
      width: 8px;
    }
    .o-table-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      @include scrollbar;
    }
    table {
      table-layout: fixed;
    }

    tr {
      td {
        &:last-child {
          width: 220px;
          position: sticky;
          right: 0;
          z-index: 2;
          background: var(--table-bg-color);
          &::before {
            left: 0;
            @include liner;
          }
        }
      }
      &.last {
        td {
          border-bottom: 0 none;
        }
      }
      &:hover td {
        background: var(--table-row-hover);
      }
    }

    th {
      &:last-child {
        width: 220px;
        position: sticky;
        right: 0;
        z-index: 2;
        background: var(--table-head-bg);
        &::before {
          left: 0;
          @include liner;
        }
      }
    }
  }
}
</style>
