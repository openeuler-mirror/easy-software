<script lang="ts" setup>
import { type PropType } from 'vue';
import { OTable, OIcon, OPopover, OScroller } from '@opensig/opendesign';
import type { MoreMessgeT } from '@/@types/app';

import IconHelp from '~icons/app/icon-help.svg';

interface ColumnsT {
  label: string;
  key: string;
  style?: string;
}

defineProps({
  data: {
    type: Array as PropType<Array<MoreMessgeT>>,
    default: () => {
      return [];
    },
  },
  columns: {
    type: Array as PropType<Array<ColumnsT>>,
    default: () => {
      return [];
    },
  },
});
</script>

<template>
  <div class="table-header">
    <OTable :columns="columns" :small="true">
      <template #th_flags>
        <span class="flags">
          Flags
          <OPopover position="top" trigger="hover" style="width: 168px">
            <template #target>
              <OIcon ref="flagsRef" class="flags-icon"><IconHelp /></OIcon>
            </template>
            <div class="box">EQ表示相等，表示两个版本或者状态是相同的，GE表示大于</div>
          </OPopover>
        </span>
      </template>
    </OTable>
  </div>
  <!-- body 内容滚动 -->
  <div class="table-body">
    <OScroller :show-type="data.length > 10 ? 'always' : 'never'">
      <OTable :columns="columns" :data="data" border="row-column" :small="true" />
    </OScroller>
  </div>
</template>

<style lang="scss" scoped>
.table-header {
  :deep(.o-table) {
    .o-table-wrap {
      --table-radius: 4px 4px 0 0;
    }
    .o-table-tip-wrap {
      display: none;
    }
  }
}
.table-body {
  border: 1px solid var(--o-color-control4);
  border-top: 0;
  border-radius: 0 0 4px 4px;
  .o-scroller {
    max-height: 500px;
    --scrollbar-height: 500px;
  }
  :deep(.o-table) {
    .o-table-wrap {
      --table-radius: 0 0 4px 4px;
    }
    thead {
      display: none;
    }
  }
}

.flags {
  display: flex;
  align-items: center;
  .flags-icon {
    font-size: 16px;
    cursor: pointer;
    margin-left: 8px;
    color: var(--o-color-info1);
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
