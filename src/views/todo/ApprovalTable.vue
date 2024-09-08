<script lang="ts" setup>
import { ref, type PropType, type ComponentPublicInstance, onMounted, computed } from 'vue';
import { OTable, OLink, OTag, ODialog, OButton, OPopup, OIcon, OPopover } from '@opensig/opendesign';
import { useLocale } from '@/composables/useLocale';
import { formatDateTime } from '@/utils/common';
import { useRouter, useRoute } from 'vue-router';
import { applicationTypeCurrent, applyStatusType } from '@/data/todo';
import { applicationTypeConvert, applyStatusConvert } from '@/utils/collaboration';
import { onClickOutside } from '@vueuse/core';
import { getAdminApplyRepos, getMaintainerApplyRepos } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import FilterableCheckboxes from '@/components/FilterableCheckboxes.vue';

import IconFilter from '~icons/app/icon-filter.svg';
import IconHelp from '~icons/app/icon-help.svg';

interface ColumnsT {
  key: string;
  label: string;
  width?: string;
  type?: string;
  fixed?: string;
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
  filterParams: {
    type: Object,
    default: () => ({}),
  },
});

const userInfoStore = useUserInfoStore();
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

const router = useRouter();
const route = useRoute();
const { locale } = useLocale();

const repoList = ref<string[]>([]);

const getRepoList = () => {
  let applyStatus = '';
  if (isAdminPer.value) {
    if (props.type === 'approval' || props.type === 'approved') {
      applyStatus = props.type === 'approval' ? 'OPEN,REJECTED' : 'APPROVED,REJECTED';
    } else if (props.type === 'application') {
      applyStatus = 'OPEN,REJECTED,APPROVED,REJECTED';
    }
    const params = {
      apply_status: applyStatus,
    };

    getAdminApplyRepos(params)
      .then((data) => (repoList.value = data.list))
      .finally(() => (repoFilterLoading.value = false));
  } else {
    getMaintainerApplyRepos()
      .then((data) => (repoList.value = data.list))
      .finally(() => (repoFilterLoading.value = false));
  }
};

const innerFilterParams = ref(props.filterParams);
const filterableColumns = ref(Object.keys(props.filterParams));

const applyTypes = applicationTypeCurrent.map((item) => ({ label: item.label, value: item.id }));

const filterIconRefs = ref(new Array<ComponentPublicInstance>(props.columns.length));

/** 筛选组件是否显示的开关 */
const filterSwitches = ref(props.columns.map(() => false));

const setPopupClickoutSideFn = (el: any, index: number) => {
  onClickOutside(el, () => {
    filterSwitches.value[index] = false;
  });
};

onMounted(() => {
  Object.entries(props.filterParams).forEach(([key, value]) => {
    if (value) {
      const index = props.columns.findIndex((item) => item.key === key);
      currentActiveFilterIndices.value.add(index);
      activeFilterValues.value[index] = value;
    }
  });
});

/** 当前有选中筛选项的表格列的数组下标 */
const currentActiveFilterIndices = ref(new Set<number>());

const repoFilterLoading = ref(false);

/** 切换某个筛选组件显示开关 */
const switchFilterVisible = (index: number) => {
  filterSwitches.value[index] = true;
  if (index === 0) {
    repoFilterLoading.value = true;
    getRepoList();
  }
};

/** 各表格列对应的已选中的筛选项 */
const activeFilterValues = ref(new Array<string>(props.columns.length));

const onFilterChange = (type: string, index: number, val: string | number | (string | number)[]) => {
  filterSwitches.value = props.columns.map(() => false);
  if ((Array.isArray(val) && val.length) || (!Array.isArray(val) && val)) {
    val = Array.isArray(val) ? val.join() : val.toString();
    if (type === 'applyStatus') {
      activeFilterValues.value[index] = applyStatusConvert(val);
    } else {
      activeFilterValues.value[index] = val;
    }
    innerFilterParams.value[type] = val;
    currentActiveFilterIndices.value.add(index);
  } else {
    activeFilterValues.value[index] = '';
    currentActiveFilterIndices.value.delete(index);
  }
  emits('queryData', innerFilterParams.value);
};

const jumpTo = (id: number) => {
  const type = route.params?.type as string;
  router.push({
    path: `/${locale.value}/todo/${type}/${id}`,
  });
};

const emits = defineEmits<{
  (e: 'revoke', id: string): void;
  (e: 'queryData', params: Record<string, string>): void;
}>();

const showDlg = ref(false);
const applayId = ref();
const revokeApplication = (id: string) => {
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
    <el-table :data="data" border empty-text="暂无数据" style="width: 100%">
      <el-table-column
        v-for="(item, index) in columns"
        :key="item.key"
        :fixed="item.fixed ?? false"
        :prop="item.key"
        :width="item.width"
        :class-name="item.type"
        :resizable="false"
      >
        <template #header>
          <th v-if="!filterableColumns.includes(item.key)" :class="item.type">
            <template v-if="item.label === '申请人'">
              <div class="th-maintainer">
                申请人
                <OPopover position="top" trigger="hover">
                  <template #target>
                    <OIcon class="maintainer-icon"><IconHelp /></OIcon>
                  </template>
                  <div class="box">展示Gitee ID 不是openEuler用户名</div>
                </OPopover>
              </div>
            </template>
            <template v-else> {{ item.label }}</template>
          </th>
          <OPopup v-else trigger="none" style="--popup-radius: 4px" :visible="filterSwitches[index]" :unmount-on-hide="false" position="bl">
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
                    <OPopover v-if="currentActiveFilterIndices.has(index) && activeFilterValues[index]" :target="filterIconRefs[index]" trigger="hover">
                      <p class="bubble-content">
                        <span class="title">{{ item.label }}:</span>
                        {{ activeFilterValues[index] }}
                      </p>
                    </OPopover>
                  </template>
                </div>
              </th>
            </template>
            <div :ref="(el) => setPopupClickoutSideFn(el, index)">
              <FilterableCheckboxes
                :model-value="innerFilterParams[item.key]"
                v-if="item.key === 'metric'"
                :filterable="false"
                @change="onFilterChange(item.key, index, $event)"
                :values="applyTypes"
              />
              <FilterableCheckboxes
                :model-value="innerFilterParams[item.key]"
                v-else-if="item.key === 'repo'"
                :loading="repoFilterLoading"
                @change="onFilterChange(item.key, index, $event)"
                :values="repoList"
              />
              <FilterableCheckboxes
                :model-value="innerFilterParams[item.key]"
                v-else-if="item.key === 'applyStatus'"
                :filterable="false"
                multi
                @change="onFilterChange(item.key, index, $event)"
                :values="applyStatusType"
              />
            </div>
          </OPopup>
        </template>
        <template #default="{ row }">
          <template v-if="item.key === 'createdAt'">
            {{ formatDateTime(row.createdAt, true) }}
          </template>
          <template v-if="item.key === 'metric'">
            {{ applicationTypeConvert(row.metric) }}
          </template>
          <template v-if="item.key === 'metricStatus'">
            {{ row.metricStatus }}
          </template>
          <template v-if="item.key === 'comment'">
            <TableShowOverflowTips v-if="row.comment" :content="row.comment" :line="2" wrapper=".table-main" />
            <template v-else>-</template>
          </template>
          <template v-if="item.key === 'administrator'">
            {{ row.administrator ?? '-' }}
          </template>
          <template v-if="item.key === 'description'">
            <TableShowOverflowTips v-if="row.description" :content="row.description" :line="2" wrapper=".table-main" />
          </template>

          <template v-if="item.key === 'applyStatus'">
            <div class="apply-status">
              <OTag v-if="row.applyStatus" :class="row.applyStatus?.toLocaleLowerCase()">{{ applyStatusConvert(row.applyStatus) }} </OTag>
            </div>
          </template>
          <template v-if="item.key === 'operation'">
            <template v-if="type === 'application'">
              <div class="oper-box">
                <OLink color="primary" hover-underline @click="jumpTo(row.applyIdString)">申请详情</OLink>
                <OLink color="danger" v-if="row.applyStatus === 'OPEN'" hover-underline @click="revokeApplication(row.applyIdString)">撤销申请</OLink>
              </div>
            </template>
            <template v-else>
              <OLink color="primary" hover-underline @click="jumpTo(row.applyIdString)">{{ type === 'approval' ? '审批' : '审批详情' }}</OLink>
            </template>
          </template>
        </template>
      </el-table-column>
    </el-table>

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
.table-main {
  position: relative;
}
.th-maintainer {
  display: flex;
  align-items: center;
  .maintainer-icon {
    width: 16px;
    margin-left: 8px;
    color: var(--o-color-info1);
  }
}
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
</style>
