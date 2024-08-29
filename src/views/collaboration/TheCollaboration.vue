<script setup lang="ts">
import { ref, watch, computed, type ComponentPublicInstance, reactive } from 'vue';
import { OTable, OTag, OLink, OIcon, OPopup, OPopover, useMessage } from '@opensig/opendesign';
import { getMaintainerRepos, getAdminRepos, getRepoSigList } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import ExternalLink from '@/components/ExternalLink.vue';
import Indicators from '@/components/collaboration/Indicators.vue';
import StatusFeedback from '@/components/collaboration/StatusFeedback.vue';
import Result404 from '@/components/Result404.vue';
import { COUNT_PAGESIZE } from '@/data/query';

import IconOutlink from '~icons/pkg/icon-outlink.svg';
import IconState from '~icons/pkg/icon-state.svg';
import IconFilter from '~icons/app/icon-filter.svg';
import FilterableCheckboxes from '@/components/FilterableCheckboxes.vue';
import { kindTypes, applicationType } from '@/data/todo';
import { onClickOutside } from '@vueuse/core';
import { repoStatusIndex, repoStatusArr, versionLatestStatusConvert } from '@/utils/collaboration';
import { storeToRefs } from 'pinia';

const columns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '类别', key: 'kind', type: 'kind' },
  { label: 'SIG名称', key: 'sigName', type: 'sig' },
  { label: 'CVE状态', key: 'cveStatus', type: 'cve' },
  { label: 'Issue状态', key: 'issueStatus', type: 'issue' },
  { label: '软件包更新状态', key: 'prStatus', type: 'pr' },
  { label: '软件包版本状态', key: 'versionStatus', type: 'version' },
  { label: '贡献组织状态', key: 'orgStatus', type: 'org' },
  { label: '贡献人员状态', key: 'contributorStatus', type: 'personnel' },
  { label: '状态', key: 'status', type: 'status' },
  { label: '操作', key: 'operation', type: 'operation' },
];

const message = useMessage();
const { platformPermissions } = storeToRefs(useUserInfoStore());

const allSigs = ref<string[]>();
const allRepos = ref<string[]>();

// 筛选
const filterIconRefs = ref(new Array<ComponentPublicInstance>(columns.length));

/** 筛选组件是否显示的开关 */
const filterSwitches = ref(columns.map(() => false));

let clickOutsideStopFns: (() => void)[] = [];

const setPopupClickoutSideFn = (el: any, index: number) => {
  if (clickOutsideStopFns.length) {
    clickOutsideStopFns.forEach((fn) => fn());
    clickOutsideStopFns = [];
  }
  clickOutsideStopFns.push(
    onClickOutside(el, () => {
      filterSwitches.value[index] = false;
    }) as () => void
  );
};

const repoFilterLoading = ref(false);
const sigFilterLoading = ref(false);

/** 切换某个筛选组件显示开关 */
const switchFilterVisible = (index: number) => {
  filterSwitches.value[index] = true;
  if (platformPermissions.value && (index === 0 || index === 2) && (!allSigs.value?.length || !allRepos.value?.length)) {
    repoFilterLoading.value = true;
    getRepoSigList(platformPermissions.value)
      .then(data => {
        allSigs.value = data.sigs;
        allRepos.value = data.repos;
      })
      .finally(() => (repoFilterLoading.value = false));
  }
};

/** 各表格列对应的已选中的筛选项 */
const activeFilterValues = ref(new Array<string>(columns.length));

/** 当前有选中筛选项的表格列的数组下标 */
const currentActiveFilterIndices = ref(new Set<number>());

const onFilterChange = (index: number, val: string) => {
  // 关掉筛选组件
  filterSwitches.value = columns.map(() => false);
  if (val) {
    activeFilterValues.value[index] = val;
    currentActiveFilterIndices.value.add(index);
  } else {
    activeFilterValues.value[index] = '';
    currentActiveFilterIndices.value.delete(index);
  }
  if (filterParams.versionStatus === '版本正常') {
    filterParams.versionStatus = '最新版本';
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    pageInit();
  }
};

const SRCOPENEULER = 'https://gitee.com/src-openeuler/';

const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 筛选条件
const filterParams = reactive<Record<string, string | number>>({
  repo: '',
  kind: '',
  sigName: '',
  cveStatus: '',
  issueStatus: '',
  prStatus: '',
  versionStatus: '',
  orgStatus: '',
  contributorStatus: '',
  status: '',
});

const searchParams = computed(() => {
  return {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  };
});

const reposData = ref([]);
const isLoading = ref(false);
const isError = ref(false);

// Maintainer 数据
const queryMaintainerRepos = () => {
  isLoading.value = true;
  getMaintainerRepos({ ...searchParams.value, ...filterParams })
    .then((res) => {
      reposData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      isError.value = true;
      isLoading.value = false;
    });
};

// Admin 数据
const queryAdminRepos = () => {
  isLoading.value = true;
  getAdminRepos({ ...searchParams.value, ...filterParams })
    .then((res) => {
      reposData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      isError.value = true;
      isLoading.value = false;
    });
};

const pageInit = () => {
  if (isAdminPer.value) {
    queryAdminRepos();
  } else if (isMainPer.value) {
    queryMaintainerRepos();
  }
};

const loading = ref(false);

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 外链确认
const showExternalDlg = ref(false);
const externalLink = ref('');
const changeExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};

const showDlg = ref(false);

const showFeedbackDlg = ref(false);
const repoValue = ref('');
const changeFeedback = (v: string) => {
  if (userInfoStore.isGiteeAccount) {
    showFeedbackDlg.value = true;
    repoValue.value = v;
  } else {
    message.warning({
      content: '请绑定您的Gitee ID',
    });
  }
};

// 反馈历史
const showFeedbacHistroykDlg = ref(false);
const changeFeedbackHistory = (v: string) => {
  repoValue.value = v;
  showFeedbacHistroykDlg.value = true;
};

// 类型数据
const metricTypes = (v: string) => {
  const index = applicationType.findIndex((item) => item.id === v);
  if (index === -1) {
    return [];
  }
  return applicationType[index].children;
};

watch(
  () => searchParams.value,
  () => {
    pageInit();
  },
  {
    immediate: true,
  }
);
</script>
<template>
  <div class="platform-header">
    <ContentWrapper>
      <h1>软件维护详情</h1>
    </ContentWrapper>
  </div>
  <ContentWrapper :vertical-padding="['24px', '72px']" class="collaboration-wrap">
    <AppLoading :loading="isLoading" />
    <template v-if="!isLoading">
      <div class="indicators">
        <span @click="showDlg = true" class="text"
          ><OIcon><IconState /></OIcon>状态指标说明</span
        >
        <Indicators v-if="showDlg" @change="showDlg = false" />
      </div>
      <div class="platform-main">
        <OTable :columns="columns" :data="reposData" :loading="loading" border="row">
          <template #head="{ columns }">
            <OPopup
              trigger="none"
              style="--popup-radius: 4px"
              v-for="(item, index) in columns"
              :key="item.type"
              :visible="filterSwitches[index]"
              :unmount-on-hide="false"
              :offset="-8"
              position="bl"
            >
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
                  v-if="item.key === 'repo'"
                  v-model="filterParams[item.key]"
                  :loading="repoFilterLoading"
                  @change="onFilterChange(index, $event)"
                  :values="allRepos"
                />
                <FilterableCheckboxes
                  v-else-if="item.key === 'sigName'"
                  v-model="filterParams[item.key]"
                  :loading="sigFilterLoading"
                  @change="onFilterChange(index, $event)"
                  :values="allSigs"
                />
                <FilterableCheckboxes
                  v-else-if="item.key === 'kind'"
                  v-model="filterParams[item.key]"
                  @change="onFilterChange(index, $event)"
                  :filterable="false"
                  :values="kindTypes"
                />
                <FilterableCheckboxes
                  v-else-if="item.key === 'status'"
                  :filterable="false"
                  v-model="filterParams[item.key]"
                  @change="onFilterChange(index, $event)"
                  :values="repoStatusArr"
                />
                <FilterableCheckboxes
                  v-else
                  v-model="filterParams[item.key]"
                  :filterable="false"
                  @change="onFilterChange(index, $event)"
                  :values="metricTypes(item.key)"
                />
              </div>
            </OPopup>
          </template>
          <template #td_repo="{ row }">
            <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(`${SRCOPENEULER + row.repo}`)"
              ><span class="text">{{ row.repo }} </span><OIcon><IconOutlink /></OIcon
            ></OLink>
          </template>
          <template #td_issueStatus="{ row }">
            <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(`${SRCOPENEULER + row.repo}/issues`)"
              ><span class="text">{{ row.issueStatus }}</span> <OIcon><IconOutlink /></OIcon
            ></OLink>
          </template>
          <template #td_prStatus="{ row }">
            <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(`${SRCOPENEULER + row.repo}/pulls`)"
              ><span class="text">{{ row.prStatus }}</span> <OIcon><IconOutlink /></OIcon
            ></OLink>
          </template>
          <template #td_cveStatus="{ row }">
            <OLink
              color="primary"
              class="link-external"
              hover-underline
              @click="changeExternalDialog(`${SRCOPENEULER + row.repo}/issues?single_label_id=85497765`)"
            >
              <span class="text">{{ row.cveStatus }}</span> <OIcon><IconOutlink /></OIcon
            ></OLink>
          </template>
          <template #td_status="{ row }">
            <div class="repo-status">
              <OTag :class="`type${repoStatusIndex(row.status)}`">{{ row.status }} </OTag>
            </div>
          </template>
          <template #td_versionStatus="{ row }">
            {{ versionLatestStatusConvert(row.versionStatus) }}
          </template>

          <template #td_operation="{ row }">
            <div class="operation-box">
              <OLink color="primary" hover-underline @click="changeFeedback(row.repo)">状态反馈</OLink>
              <OLink color="primary" hover-underline @click="changeFeedbackHistory(row.repo)">反馈历史</OLink>
            </div>
          </template>
        </OTable>

        <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
          <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
      <!-- 暂无记录 -->
      <template v-if="isError">
        <Result404>
          <template #description>
            <p class="text404">暂无记录</p>
          </template>
        </Result404>
      </template>

      <!-- 跳转外部链接提示 -->
      <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
      <!-- 状态反馈 -->

      <StatusFeedback :repo="repoValue" v-if="showFeedbackDlg" @close="showFeedbackDlg = false" />

      <!-- 反馈历史 -->
      <FeedbackHistroy v-if="showFeedbacHistroykDlg" :repo="repoValue" @close="showFeedbacHistroykDlg = false" />
    </template>
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/collaboration/index.scss';
.collaboration-wrap {
  position: relative;
  min-height: calc(var(--layout-content-min-height) - 154px);
}
.header-cell {
  position: relative;
  display: flex;
  align-items: center;

  .filter-icon {
    width: 16px;
    cursor: pointer;
    margin-left: 8px;
  }
}
.platform-header {
  border-bottom: 1px solid var(--o-color-control4);
  padding: 48px 0 24px;
  h1 {
    color: var(--o-color-info1);
    font-weight: 500;
    @include h1;
  }
}
.indicators {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  .text {
    color: var(--o-color-info1);
    cursor: pointer;
    display: flex;
    align-items: center;
    @include text1;
    svg {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }
}
.operation-box {
  display: flex;
  align-items: center;
  .o-link + .o-link {
    margin-left: 16px;
  }
}
:deep(.link-external .o-link-label) {
  font-size: 0;
  .text {
    @include text1;
  }
  .o-icon {
    display: inline-block;
    vertical-align: middle;
    svg {
      width: 16px;
      height: 16px;
      margin-left: 8px;
    }
  }
}
.platform-main {
  @mixin liner {
    content: '';
    box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.15);
    height: 100%;
    position: absolute;
    top: 0;
    width: 8px;
  }
  :deep(.o-table) {
    --oper-width: 215px;
    &.admin {
      --oper-width: 125px;
    }

    .o-table-wrap {
      overflow-x: auto;
      overflow-y: hidden;
      @include scrollbar;
      &::-webkit-scrollbar {
        height: 6px;
      }
    }
    table {
      table-layout: fixed;
    }

    tr {
      td {
        &:first-child,
        &:nth-of-type(10),
        &:nth-of-type(11) {
          position: sticky;
          z-index: 2;
          background: var(--table-bg-color);
        }
        &:first-child {
          left: 0;
          &::before {
            right: -9px;
            transform: scaleX(-1);
            @include liner;
          }
        }
        &:nth-of-type(11) {
          right: 0;
        }
        &:nth-of-type(10) {
          right: var(--oper-width);
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
      &:first-child,
      &:nth-of-type(10),
      &:nth-of-type(11) {
        position: sticky;
        z-index: 2;
        background: var(--table-head-bg);
      }
      &:first-child {
        left: 0;
        &::before {
          right: -7px;
          transform: scaleX(-1);
          @include liner;
        }
      }
      &:nth-of-type(10) {
        right: var(--oper-width);
        &::before {
          left: -9px;
          @include liner;
        }
      }
      &:nth-of-type(11) {
        right: 0;
      }
    }

    thead {
      .repo {
        width: 200px;
      }
      .cve,
      .sig,
      .issue,
      .pr,
      .version {
        width: 188px;
      }
      .org,
      .personnel {
        width: 160px;
      }
      .kind {
        width: 180px;
      }
      .status {
        width: 125px;
      }
      .operation {
        width: var(--oper-width);
      }
    }
  }
}

.pagination-box {
  margin-top: 32px;
  display: flex;
  justify-content: end;
}
</style>
