<script lang="ts" setup>
import { ref, type PropType, computed, type ComponentPublicInstance, reactive, watch, onMounted } from 'vue';
import { OTable, OLink, OTag, ODialog, OButton, OPopup, OIcon, OPopover } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { formatDateTime } from '@/utils/common';
import { useRouter, useRoute } from 'vue-router';
import { applicationType, applyStatusType } from '@/data/todo';
import { applicationTypeConvert, applyStatusConvert, versionLatestStatusConvert } from '@/utils/collaboration';
import { useUserInfoStore } from '@/stores/user';

import IconFilter from '~icons/app/icon-filter.svg';
import FilterableCheckboxes from '@/components/FilterableCheckboxes.vue';
import { onClickOutside, useDebounceFn } from '@vueuse/core';
import { getAdminApplyRepos, getMaintainerApplyRepos } from '@/api/api-collaboration';

interface ColumnsT {
  key: string;
  label: string;
  width?: string;
  type?: string;
}

const props = defineProps({
  filterableColumns: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
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

const router = useRouter();
const route = useRoute();
const { locale } = useLocale();

const repoList = ref<string[]>([]);

const getRepoList = () => {
  if (props.type === 'approval' || props.type === 'approved') {
    getAdminApplyRepos()
      .then((data) => repoList.value = data.list)
      .finally(() => repoFilterLoading.value = false);
  } else {
      getMaintainerApplyRepos().then((data) => repoList.value = data.list)
      .finally(() => repoFilterLoading.value = false);
  }
};

const filterParams = reactive(
  props.filterableColumns.reduce(
    (obj, col) => {
      obj[col] = '';
      return obj;
    },
    {} as Record<string, string>
  )
);

watch(filterParams, (params) => emits('queryData', params));

const filterableColSet = computed(() => new Set(props.filterableColumns));
const applyTypes = applicationType.map((item) => ({ label: item.label, value: item.id }));

const filterIconRefs = ref(new Array<ComponentPublicInstance>(props.columns.length));

/** 筛选组件是否显示的开关 */
const filterSwitches = ref(props.columns.map(() => false));

const setPopupClickoutSideFn = (el: any, index: number) => {
  onClickOutside(el, () => {
    filterSwitches.value[index] = false;
  });
};

/** 当前有选中筛选项的表格列的数组下标 */
const currentActiveFilterIndices = ref(new Set<number>());

const repoFilterLoading = ref(false);

/** 切换某个筛选组件显示开关 */
const switchFilterVisible = (index: number) => {
  filterSwitches.value = props.columns.map((_, idx) => {
    if (idx === index) {
      return !filterSwitches.value[idx];
    }
    return false;
  });
  if (index === 0) {
    repoFilterLoading.value = true;
    getRepoList();
  }
};

/** 各表格列对应的已选中的筛选项 */
const activeFilterValues = ref(new Array<string[]>(props.columns.length));

const onFilterChange = useDebounceFn((type: string, index: number, val: { values: (string | number)[]; isCheckAll: boolean }) => {
  filterSwitches.value = props.columns.map(() => false);
  if (val.values.length > 0) {
    currentActiveFilterIndices.value.add(index);
  } else {
    currentActiveFilterIndices.value.delete(index);
  }
  if (val.isCheckAll) {
    filterParams[type] = '';
    activeFilterValues.value[index] = [];
    currentActiveFilterIndices.value.delete(index);
  } else {
    filterParams[type] = val.values.join();
    if (type === 'metric') {
      activeFilterValues.value[index] = val.values.map((item) => applyStatusConvert(item as string));
    } else {
      activeFilterValues.value[index] = val.values as string[];
    }
  }
}, 300);

const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);

const jumpTo = (id: number) => {
  const type = route.params?.type as string;
  router.push({
    path: `/${locale.value}/todo/${type}/${id}`,
  });
};

const emits = defineEmits<{
  (e: 'revoke', id: number): void;
  (e: 'queryData', params: Record<string, string>): void;
}>();

const showDlg = ref(false);
const applayId = ref();
const revokeApplication = (id: number) => {
  applayId.value = id;
  showDlg.value = true;
};

const revoke = () => {
  emits('revoke', applayId.value);
  showDlg.value = false;
};
</script>

<template>
  <div class="table-main" :class="type">
    <OTable :columns="columns" :data="data" :loading="loading" border="all">
      <template #head="{ columns }">
        <template v-for="(item, index) in columns" :key="item.type">
          <th v-if="!filterableColSet.size || !filterableColSet.has(item.key)" :class="item.type">
            {{ item.label }}
          </th>
          <OPopup :ref="(el) => setPopupClickoutSideFn(el, index)" v-else trigger="none" style="--popup-radius: 4px" :visible="filterSwitches[index]" :unmount-on-hide="false" position="bl">
            <template #target>
              <th :class="item.type">
                <div class="header-cell">
                  {{ item.label }}
                  <template v-if="item.key !== 'operation'">
                    <OIcon
                      :ref="(el) => (filterIconRefs[index] = el as ComponentPublicInstance)"
                      class="filter-icon"
                      :style="currentActiveFilterIndices.has(index) ? { color: 'var(--o-color-primary1)' } : {}"
                      @click="switchFilterVisible(index)"
                      ><IconFilter
                    /></OIcon>
                    <OPopover :target="filterIconRefs[index]" trigger="hover">
                      <p class="bubble-content">
                        <span class="title">{{ item.label }}:</span>
                        {{ activeFilterValues[index]?.join('、') }}
                      </p>
                    </OPopover>
                  </template>
                </div>
              </th>
            </template>
            <FilterableCheckboxes v-if="item.key === 'metric'" :filterable="false" @change="onFilterChange(item.key, index, $event)" :values="applyTypes" />
            <FilterableCheckboxes v-else-if="item.key === 'repo'" :loading="repoFilterLoading" @change="onFilterChange(item.key, index, $event)" :values="repoList" />
            <FilterableCheckboxes v-else-if="item.key === 'applyStatus'" :filterable="false" @change="onFilterChange(item.key, index, $event)" :values="applyStatusType" />
          </OPopup>
        </template>
      </template>
      <template #td_updateAt="{ row }">
        {{ formatDateTime(row.updateAt) }}
      </template>
      <template #td_metric="{ row }">
        {{ applicationTypeConvert(row.metric) }}
      </template>
      <template #td_metricStatus="{ row }">
        {{ versionLatestStatusConvert(row.metricStatus) }}
      </template>
      <template #td_comment="{ row }">
        <div class="line-clamp">{{ row.comment }}</div>
      </template>
      <template #td_description="{ row }">
        <div class="line-clamp">{{ row.description }}</div>
      </template>
      <template #td_applyStatus="{ row }">
        <div class="apply-status">
          <OTag v-if="row.applyStatus" :class="row.applyStatus?.toLocaleLowerCase()">{{ applyStatusConvert(row.applyStatus) }} </OTag>
        </div>
      </template>
      <template #td_operation="{ row }">
        <template v-if="type === 'application'">
          <div class="oper-box">
            <OLink color="primary" hover-underline @click="jumpTo(row.applyIdString)">申请详情</OLink>
            <OLink color="danger" v-if="row.applyStatus === 'OPEN' && isMainPer" hover-underline @click="revokeApplication(row.applyIdString)">撤销申请</OLink>
          </div>
        </template>
        <template v-if="type === 'approval'">
          <OLink color="primary" hover-underline @click="jumpTo(row.applyIdString)">审批</OLink>
        </template>
        <template v-if="type === 'approved'">
          <OLink color="primary" hover-underline @click="jumpTo(row.applyIdString)">审批详情</OLink>
        </template>
      </template>
    </OTable>
    <ODialog v-model:visible="showDlg" class="revoke-dlg" :unmount-on-hide="true" :mask="true" size="small">
      <template #header>
        <p class="title">确认撤销</p>
      </template>
      <p class="revoke-text">撤销后内容不可恢复，确认是否撤销？</p>
      <template #footer>
        <div class="dlg-action">
          <OButton variant="solid" size="large" color="primary" class="upload" @click="revoke">确认</OButton>
          <OButton variant="outline" size="large" color="primary" class="upload" @click="showDlg = false">取消</OButton>
        </div>
      </template>
    </ODialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';

.revoke-text {
  color: var(--o-color-info1);
  text-align: center;
  @include text1;
}
.dlg-action {
  display: flex;
  justify-content: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
}
.oper-box {
  display: flex;
  align-items: center;
  .o-link + .o-link {
    margin-left: 24px;
  }
}
.line-clamp {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  position: relative;
  word-break: break-all;
}

:deep(.o-table) {
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
  .applyStatus {
    width: 135px;
  }
  .administrator,
  .maintainer {
    width: 120px;
  }

  .applyId {
    width: 150px;
  }

  .comment {
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
            left: -9px;
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
          left: -9px;
          @include liner;
        }
      }
    }
  }
}
</style>
