<script setup lang="ts">
import { ref, watch, computed, onMounted, type ComponentPublicInstance, reactive, toRefs } from 'vue';
import { OTable, OTag, OLink, OIcon, OPopup, OPopover } from '@opensig/opendesign';
import { getMaintainerRepos, getAdminRepos, getSigList, getRepoList } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import ExternalLink from '@/components/ExternalLink.vue';
import Indicators from '@/components/collaboration/Indicators.vue';
import StatusFeedback from '@/components/collaboration/StatusFeedback.vue';
import Result404 from '@/components/Result404.vue';

import IconOutlink from '~icons/pkg/icon-outlink.svg';
import IconFilter from '~icons/app/icon-filter.svg';
import FilterableCheckboxes from '@/components/FilterableCheckboxes.vue';
import GiteeAccountDialog from '@/components/collaboration/GiteeAccountDialog.vue';
import { collaborationFilter } from '@/data/filter';
import { useDebounceFn } from '@vueuse/core';
import { repoStatusIndex } from '@/data/todo';

const columns = [
  { label: '软件仓库', key: 'repo', type: 'repo' },
  { label: '类别', key: 'kind', type: 'kind' },
  { label: 'SIG名称', key: 'sigName', type: 'sig' },
  { label: 'CVE状态', key: 'cveStatus', type: 'cve' },
  { label: 'ISSUE状态', key: 'issueStatus', type: 'issue' },
  { label: '软件包更新状态', key: 'prStatus', type: 'pr' },
  { label: '软件包版本状态', key: 'versionStatus', type: 'version' },
  { label: '贡献组织状态', key: 'orgStatus', type: 'org' },
  { label: '贡献人员状态', key: 'contributorStatus', type: 'personnel' },
  { label: '状态', key: 'status', type: 'status' },
  { label: '操作', key: 'operation', type: 'operation' },
];

const { identities } = toRefs(useUserInfoStore());

const hasGiteeAccount = computed(() => !!identities.value.find((id) => id.identity === 'gitee'));

const allSigs = ref<string[]>();
const allRepos = ref<string[]>();
const displayRepos = ref<string[]>();

// 筛选
const filterPopupTargets = ref(new Array<ComponentPublicInstance>(columns.length));

// 筛选组件是否显示的开关
const filterSwitches = ref(columns.map(() => false));

// 切换某个筛选组件显示开关
const switchFilterVisible = (index: number) => {
  filterSwitches.value[index] = !filterSwitches.value[index];
};

const onFilterChange = useDebounceFn((type: string, values: (string | number)[]) => {
  filterParams[type] = values.join();
}, 300);

watch(
  () => filterSwitches.value[0],
  (val) => {
    if (!val) {
      displayRepos.value = allRepos.value?.slice(0, 30);
    }
  }
);

const onRepoFilterScrollBottom = () => {
  displayRepos.value && (displayRepos.value = allRepos.value?.slice(0, displayRepos.value?.length + 30));
};

const SRCOPENEULER = 'https://gitee.com/src-openeuler/';

const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);
const isMainAllPer = computed(() => userInfoStore.platformMaintainerAllPermission);
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 筛选条件
const filterParams = reactive<Record<string, string>>({
  repo: '' as string,
  kind: '' as string,
  sigName: '' as string,
  cveStatus: '' as string,
  issueStatus: '' as string,
  prStatus: '' as string,
  versionStatus: '' as string,
  orgStatus: '' as string,
  contributorStatus: '' as string,
  status: '' as string,
});

const searchParams = computed(() => {
  return {
    name: 'fromPage',
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    ...filterParams,
  };
});

const reposData = ref([]);
const isLoading = ref(false);
const isError = ref(false);

// Maintainer 数据
const queryMaintainerRepos = () => {
  isLoading.value = true;
  getMaintainerRepos(searchParams.value)
    .then((res) => {
      if (res.data.list.length > 0) {
        reposData.value = res.data.list;
        total.value = res.data.total;
      } else {
        reposData.value = [];
        isError.value = true;
      }
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
  getAdminRepos(searchParams.value)
    .then((res) => {
      if (res.data.list.length > 0) {
        reposData.value = res.data.list;
        total.value = res.data.total;
      } else {
        reposData.value = [];
        isError.value = true;
      }
      isLoading.value = false;
    })
    .catch(() => {
      reposData.value = [];
      isError.value = true;
      isLoading.value = false;
    });
};

onMounted(() => {
  getSigList().then((list) => (allSigs.value = list));
  getRepoList().then((list) => {
    allRepos.value = list;
    displayRepos.value = allRepos.value.slice(0, 30);
  });
});

const pageInit = () => {
  if (isAdminPer.value) {
    queryAdminRepos();
  }
  if (isMainPer.value) {
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
const showGiteeDlg = ref(false);
const changeFeedback = (v: string) => {
  if (isMainAllPer.value) {
    showFeedbackDlg.value = true;
    repoValue.value = v;
  } else {
    showGiteeDlg.value = true;
  }
};

// 反馈历史
const showFeedbacHistroykDlg = ref(false);
const changeFeedbackHistory = (v: string) => {
  repoValue.value = v;
  showFeedbacHistroykDlg.value = true;
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
  <ContentWrapper vertical-padding="24px" class="collaboration-wrap">
    <AppLoading :loading="isLoading" />
    <div class="indicators">
      <span @click="showDlg = true" class="text">状态指标说明</span>
      <Indicators v-if="showDlg" @change="showDlg = false" />
    </div>
    <div class="platform-main maintainer">
      <OTable :columns="columns" :data="reposData" :loading="loading" border="row">
        <template #head="{ columns }">
          <th v-for="(item, index) in columns" :key="item.type" :class="item.type" :ref="(el) => (filterPopupTargets[index] = el as ComponentPublicInstance)">
            <div class="header-cell">
              {{ item.label }}
              <template v-if="item.key !== 'operation'">
                <OPopover>
                  <p class="bubble-content">
                    <span class="title">{{ item.label }}:</span> {{ reposData.map((row) => row[item.key]).join('、') }}
                  </p>
                  <template #target>
                    <OIcon class="filter-icon" @click="switchFilterVisible(index)"><IconFilter /></OIcon>
                  </template>
                </OPopover>
                <OPopup trigger="none" :visible="filterSwitches[index]" :unmount-on-hide="false" position="bl" :target="filterPopupTargets[index]">
                  <FilterableCheckboxes
                    @scroll-bottom="onRepoFilterScrollBottom"
                    :detect-scroll-bottom="true"
                    @change="onFilterChange(item.key, $event)"
                    v-if="item.key === 'repo'"
                    :values="displayRepos"
                  />
                  <FilterableCheckboxes @change="onFilterChange(item.key, $event)" v-else-if="item.key === 'sigName'" :values="allSigs" />
                  <FilterableCheckboxes @change="onFilterChange(item.key, $event)" v-else-if="item.key === 'kind'" />
                  <FilterableCheckboxes :filterable="false" @change="onFilterChange(item.key, $event)" v-else :values="collaborationFilter[item.key]" />
                </OPopup>
              </template>
            </div>
          </th>
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
        <template #td_operation="{ row }">
          <div class="operation-box">
            <OLink v-if="!isAdminPer" color="primary" hover-underline @click="changeFeedback(row.repo)">状态反馈</OLink>
            <OLink color="primary" hover-underline @click="changeFeedbackHistory(row.repo)">反馈历史</OLink>
          </div>
        </template>
      </OTable>

      <div class="pagination-box">
        <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <GiteeAccountDialog v-if="showGiteeDlg" @close="showGiteeDlg = false" />

    <!-- 暂无记录 -->
    <template v-if="isError || !hasGiteeAccount">
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

    // 反馈历史
    <FeedbackHistroy v-if="showFeedbacHistroykDlg" :repo="repoValue" @close="showFeedbacHistroykDlg = false" />
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/collaboration/index.scss';

.collaboration-wrap {
  position: relative;
  min-height: calc(var(--layout-content-min-height) - 200px);
}

.bubble-content {
  color: var(--o-color-info1);
  max-width: 300px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;

  .title {
    font-weight: bold;
  }
}

.header-cell {
  position: relative;
  display: flex;
  align-items: center;

  .filter-icon {
    width: 16px;
    cursor: pointer;
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
    @include text1;
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
    thead {
      .repo {
        width: 200px;
      }
      .cve,
      .sig,
      .issue,
      .pr,
      .version {
        width: 180px;
      }
      .org,
      .personnel {
        width: 140px;
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
  &.maintainer {
    :deep(.o-table) {
      --oper-width: 215px;

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
              right: 0;
              transform: scaleX(-1);
              @include liner;
            }
          }
          &:nth-of-type(11) {
            right: 0px;
          }
          &:nth-of-type(10) {
            right: var(--oper-width);
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
            right: 0;
            transform: scaleX(-1);
            @include liner;
          }
        }
        &:nth-of-type(10) {
          right: var(--oper-width);
          &::before {
            left: 0;
            @include liner;
          }
        }
        &:nth-of-type(11) {
          right: 0;
        }
      }
    }
  }
}

.pagination-box {
  margin-top: 24px;
  display: flex;
  justify-content: end;
}
</style>
