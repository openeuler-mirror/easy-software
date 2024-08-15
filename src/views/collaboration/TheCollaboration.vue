<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { OTable, OTag, OLink, OIcon } from '@opensig/opendesign';
import { getMaintainerRepos, getAdminRepos } from '@/api/api-collaboration';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import ExternalLink from '@/components/ExternalLink.vue';
import Indicators from '@/components/collaboration/Indicators.vue';
import StatusFeedback from '@/components/collaboration/StatusFeedback.vue';

import IconOutlink from '~icons/pkg/icon-outlink.svg';

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

const SRCOPENEULER = 'https://gitee.com/src-openeuler/';

const userInfoStore = useUserInfoStore();
const isMainPer = computed(() => userInfoStore.platformMaintainerPermission);
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const data = ref([]);
const isLoading = ref(false);
const queryMaintainerRepos = () => {
  getMaintainerRepos()
    .then((res) => {
      data.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {});
};

const queryAdminRepos = () => {
  getAdminRepos()
    .then((res) => {
      data.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {});
};

const pageInit = () => {
  // if (isMainPer) {
  //   queryMaintainerRepos();
  // }

  if (isAdminPer.value) {
    queryAdminRepos();
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
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};

const showDlg = ref(false);

const showFeedbackDlg = ref(false);
const repoValue = ref('');
const changeFeedback = (v: string) => {
  showFeedbackDlg.value = true;
  repoValue.value = v;
};

onMounted(() => {
  pageInit();
});
</script>
<template>
  <div class="platform-header">
    <ContentWrapper>
      <h1>软件维护详情</h1>
    </ContentWrapper>
  </div>
  <ContentWrapper vertical-padding="24px" class="pkg-content-wrap">
    <div class="indicators">
      <span @click="showDlg = true" class="text">状态指标说明</span>
      <Indicators v-if="showDlg" @change="showDlg = false" />
    </div>
    <div class="platform-main" :class="isAdminPer ? 'maintainer' : 'admin'">
      <OTable :columns="columns" :data="data" :loading="loading" border="row">
        <template #head="{ columns }">
          <th v-for="item in columns" :key="item.type" :class="item.type">{{ item.label }}</th>
        </template>
        <template #td_repo="{ row }">
          <OLink color="primary" class="link-external" hover-underline @click="onExternalDialog(`${SRCOPENEULER + row.repo}`)"
            ><span class="text">{{ row.repo }} </span><OIcon><IconOutlink /></OIcon
          ></OLink>
        </template>
        <template #td_issueStatus="{ row }">
          <OLink color="primary" class="link-external" hover-underline @click="onExternalDialog(`${SRCOPENEULER + row.repo}/issues`)"
            ><span class="text">{{ row.issueStatus }}</span> <OIcon><IconOutlink /></OIcon
          ></OLink>
        </template>
        <template #td_prStatus="{ row }">
          <OLink color="primary" class="link-external" hover-underline @click="onExternalDialog(`${SRCOPENEULER + row.repo}/pulls`)"
            ><span class="text">{{ row.prStatus }}</span> <OIcon><IconOutlink /></OIcon
          ></OLink>
        </template>
        <template #td_cveStatus="{ row }">
          <OLink color="primary" class="link-external" hover-underline @click="onExternalDialog(`${SRCOPENEULER + row.repo}/issues?single_label_id=85497765`)">
            <span class="text">{{ row.cveStatus }}</span> <OIcon><IconOutlink /></OIcon
          ></OLink>
        </template>
        <template #td_status="{ row }">
          <OTag class="app-tag">{{ row.status }} </OTag>
        </template>
        <template #td_operation="{ row }">
          <div class="operation-box">
            <OLink color="primary" hover-underline @click="changeFeedback(row.repo)">状态反馈</OLink>
            <OLink color="primary" hover-underline> 反馈历史</OLink>
          </div>
        </template>
      </OTable>

      <div class="pagination-box">
        <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
    <!-- 跳转外部链接提示 -->
    <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
    <!-- 状态反馈 -->

    <StatusFeedback :repo="repoValue" v-if="showFeedbackDlg" @close="showFeedbackDlg = false" />
  </ContentWrapper>
</template>

<style scoped lang="scss">
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
        width: 120px;
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
