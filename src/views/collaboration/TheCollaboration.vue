<script setup lang="ts">
import { ref, watch, computed, reactive, onMounted } from 'vue';
import { OButton, OTag, OLink, OIcon, OPopup, OPopover, useMessage } from '@opensig/opendesign';
import { getCollaborationRepos, getRepoSigList } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import ExternalLink from '@/components/ExternalLink.vue';
import Indicators from '@/components/collaboration/Indicators.vue';
import StatusFeedback from '@/components/collaboration/StatusFeedback.vue';
import TableColumnSettings from './TableColumnSettings.vue';
import Result404 from '@/components/Result404.vue';
import { COUNT_PAGESIZE } from '@/data/query';
import { type CollaborationColumnsT } from '@/@types/collaboration';
import xss from 'xss';
import { kindTypes, applicationType, securityTypes } from '@/data/todo';
import { repoStatusIndex, repoStatusArr } from '@/utils/collaboration';
import AppLoading from '@/components/AppLoading.vue';

import IconOutlink from '~icons/pkg/icon-outlink.svg';
import IconState from '~icons/pkg/icon-state.svg';
import IconSetting from '~icons/app/icon-settings.svg';
import IconHelp from '~icons/app/icon-help.svg';
import FilterableTableHeader from '@/components/FilterableTableHeader.vue';

/**
 * isDefault 是否是默认字段
 * isFilter 是否可筛选
 * isChecked 是否可编辑
 *
 * **/
const columns = reactive<CollaborationColumnsT[]>([
  { label: '软件仓库', key: 'repo', type: 'repo', width: '200', fixed: 'left', isDefault: true, isFilter: true },
  {
    label: '软件包版本信息',
    key: 'versionInfo',
    type: 'version-box',
    isDefault: true,
    children: [
      { label: '软件包版本状态', key: 'versionStatus', type: 'version', width: '180', isFilter: true },
      { label: '上游版本', key: 'upVersion', type: 'version', width: '180' },
      { label: '当前版本', key: 'eulerVersion', type: 'version', width: '180' },
    ],
  },
  { label: 'CVE状态', key: 'cveStatus', type: 'cve', width: '188', isDefault: true, isFilter: true },
  { label: 'Issue状态', key: 'issueStatus', type: 'issue', width: '188', isFilter: true },
  { label: '软件包更新状态', key: 'prStatus', type: 'pr', width: '188', isFilter: true },
  { label: '贡献组织状态', key: 'orgStatus', type: 'org', width: '180', isFilter: true },
  { label: '贡献人员状态', key: 'contributorStatus', type: 'personnel', width: '180', isFilter: true },
  { label: '类别', key: 'kind', type: 'kind', width: '180', isFilter: true },
  { label: 'SIG名称', key: 'sigName', type: 'sig', width: '188', isFilter: true },
  { label: '软件维护级别', key: 'level', type: 'level', width: '165', isFilter: true },
  { label: '状态', key: 'status', type: 'status', width: '125', fixed: 'right', isDefault: true, isFilter: true },
  { label: '建议', key: 'suggestions', type: 'recommend', width: '203', fixed: 'right', isDefault: true },
  { label: '操作', key: 'operation', type: 'operation', width: '160', fixed: 'right', isDefault: true },
]);

const message = useMessage();

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
  level: '',
});

// 软件包维护级别
const securityLevel = computed(() => {
  return securityTypes.map((item) => item.id);
});

const sigRepoMap = ref(new Map<string, string[]>());
const allSigs = computed(() => Array.from(sigRepoMap.value.keys()));
const allRepos = computed(() => {
  if (filterParams.sigName) {
    return sigRepoMap.value.get(filterParams.sigName as string) ?? [];
  }
  return Array.from(sigRepoMap.value.values()).flat();
});

const filterLoading = ref(false);

/** 切换某个筛选组件显示开关 */
const switchFilterVisible = async (key: string) => {
  if ((key === 'repo' || key === 'sigName') && !sigRepoMap.value.size) {
    filterLoading.value = true;
    let data: Record<string, string> | null = null;
    try {
      if (isAdminPer.value) {
        data = await getRepoSigList('admin');
      } else if (isMainPer.value) {
        data = await getRepoSigList('maintainer');
      }
      if (!data) {
        return;
      }
      Object.entries(data).forEach(([repo, sig]) => {
        let repoList = sigRepoMap.value.get(sig);
        if (!repoList) {
          repoList = [repo];
          return sigRepoMap.value.set(sig, repoList);
        }
        repoList.push(repo);
      });
    } finally {
      filterLoading.value = false;
    }
  }
};

const onFilterChange = (filterKey: string, val: (string | number)[] | string | number) => {
  if ((Array.isArray(val) && val.length) || (!Array.isArray(val) && val)) {
    val = Array.isArray(val) ? val.join() : val.toString();
    filterParams[filterKey] = val;
  } else {
    filterParams[filterKey] = '';
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    queryCollaborationRepos();
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
const queryCollaborationRepos = async () => {
  isLoading.value = true;
  const params = { ...searchParams.value, ...filterParams };
  try {
    if (isAdminPer.value) {
      const { data } = await getCollaborationRepos(params, 'admin');
      reposData.value = data.list;
      total.value = data.total;
    } else if (isMainPer.value) {
      const { data } = await getCollaborationRepos(params, 'maintainer');
      reposData.value = data.list;
      total.value = data.total;
    }

    isLoading.value = false;
  } catch {
    reposData.value = [];
    isError.value = true;
    isLoading.value = false;
  }
};

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
const changeExternalDialog = (repo: string) => {
  externalLink.value = repo;
  showExternalDlg.value = true;
};

const showDlg = ref(false);

const showFeedbackDlg = ref(false);
const repoValue = ref('');
const changeFeedback = (v: string) => {
  if (userInfoStore.getGiteeId) {
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

// 当前版本、上游版本数据处理
interface VersionInfoT {
  pkg: string;
  upVersion: string;
  eulerVersion: string;
}
// 获取当前版本、上游版本数据 并去重
const updateVersionValue = <K extends keyof VersionInfoT>(data: VersionInfoT[], type: K): string[] => {
  let versionMap = new Set(data.map((item) => item[type]));
  const newVersion: string[] = [];
  Array.from(versionMap).forEach((item) => {
    if (item) {
      newVersion.push(item);
    }
  });
  return newVersion;
};

// 根据当前版本、上游版本数据 获取软件包名
const updateVersionPkg = <K extends keyof VersionInfoT>(data: VersionInfoT[], type: K) => {
  const version = updateVersionValue(data, type);
  const newPkg: VersionInfoT[] = [];
  data.forEach((item) => {
    if (version.includes(item[type])) {
      newPkg.push(item);
    }
  });
  return newPkg;
};

watch(
  () => searchParams.value,
  () => {
    queryCollaborationRepos();
  },
  {
    immediate: true,
  }
);

const checkboxValue = ref<string[]>([]);
const updateColumns = (v: string[]) => {
  columns.forEach((item) => {
    item.isChecked = v.includes(item.key) ? true : false;
  });
};

onMounted(() => {
  const collaborationColumns = localStorage.getItem('collaborationColumns');
  if (collaborationColumns) {
    updateColumns(xss(collaborationColumns).split(','));
  }

  checkboxValue.value = columns.map((item) => {
    return item.isChecked || item.isDefault ? item.key : '';
  });
});

watch(
  () => checkboxValue.value,
  (v) => {
    updateColumns(v);
  },
  { deep: true }
);
</script>
<template>
  <div class="platform-header">
    <ContentWrapper>
      <h1>软件维护详情</h1>
      <p class="text">软件包来源于openEuler-24.09版本</p>
    </ContentWrapper>
  </div>
  <ContentWrapper :vertical-padding="['24px', '72px']" class="collaboration-wrap">
    <div class="indicators">
      <span @click="showDlg = true" class="text">
        <OIcon><IconState /></OIcon>状态指标说明
      </span>
      <OPopup trigger="click" :style="{ '--popup-radius': '4px', '--popup-bg-color': ' var(--o-color-fill2)' }" position="br">
        <template #target>
          <OButton variant="outline" ref="settingRef" class="setting-btn" round="pill">
            <template #icon><IconSetting /></template>
          </OButton>
        </template>
        <TableColumnSettings :options="columns" v-model="checkboxValue" />
      </OPopup>
      <Indicators v-if="showDlg" @change="showDlg = false" />
    </div>
    <div v-if="!isError" class="platform-main">
      <div class="platform-main-table" :class="reposData.length === 0 ? 'empty' : ''">
        <el-table :data="reposData" empty-text="暂无数据" border style="width: 100%">
          <template v-for="item in columns">
            <el-table-column
              v-if="item.isDefault || item.isChecked"
              :key="item.key"
              :fixed="item.fixed"
              :prop="item.key"
              :width="item.width"
              :class-name="item.type"
              :resizable="false"
            >
              <template #header>
                <template v-if="item.isFilter">
                  <FilterableTableHeader
                    v-if="item.key === 'repo'"
                    :model-value="filterParams[item.key]"
                    :loading="filterLoading"
                    :options="allRepos"
                    @change="onFilterChange(item.key, $event)"
                    @options-visibility-change="switchFilterVisible(item.key)"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                  <FilterableTableHeader
                    v-else-if="item.key === 'sigName'"
                    :model-value="filterParams[item.key]"
                    :loading="filterLoading"
                    @change="onFilterChange(item.key, $event)"
                    @options-visibility-change="switchFilterVisible(item.key)"
                    :options="allSigs"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                  <FilterableTableHeader
                    v-else-if="item.key === 'kind'"
                    :model-value="filterParams[item.key]"
                    @change="onFilterChange(item.key, $event)"
                    :searchable="false"
                    :options="kindTypes"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                  <FilterableTableHeader
                    v-else-if="item.key === 'status'"
                    :model-value="filterParams[item.key]"
                    :searchable="false"
                    multi
                    @change="onFilterChange(item.key, $event)"
                    :options="repoStatusArr"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                  <FilterableTableHeader
                    v-else-if="item.key === 'level'"
                    :model-value="filterParams[item.key]"
                    :searchable="false"
                    multi
                    @change="onFilterChange(item.key, $event)"
                    :options="securityLevel"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                  <FilterableTableHeader
                    v-else
                    :model-value="filterParams[item.key]"
                    @change="onFilterChange(item.key, $event)"
                    :searchable="false"
                    :options="metricTypes(item.key)"
                  >
                    {{ item.label }}
                  </FilterableTableHeader>
                </template>
                <template v-else>{{ item.label }}</template>
              </template>
              <template #default="{ row }">
                <template v-if="item.children">
                  <el-table-column
                    v-for="subItem in item.children"
                    :label="subItem.label"
                    :prop="item.key"
                    :width="subItem.width"
                    :key="subItem.key"
                    :class="subItem.type"
                    :resizable="false"
                  >
                    <template #header>
                      <FilterableTableHeader
                        v-if="subItem.key === 'versionStatus' && subItem.isFilter"
                        :searchable="false"
                        :model-value="filterParams[subItem.key]"
                        @change="onFilterChange(subItem.key, $event)"
                        :options="metricTypes(subItem.key)"
                      >
                        {{ subItem.label }}
                      </FilterableTableHeader>
                      <template v-else>
                        {{ subItem.label }}
                        <OPopover v-if="subItem.key === 'eulerVersion'" position="top" trigger="hover">
                          <template #target>
                            <OIcon class="filter-icon"><IconHelp /></OIcon>
                          </template>
                          <div class="box">当前软件包在openEuler系统上的版本</div>
                        </OPopover>
                      </template>
                    </template>
                    <template #default="{ row }">
                      <template v-if="subItem.key === 'versionStatus'">
                        <template v-if="subItem.key === 'versionStatus' && row.versionDetailUrl">
                          <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(row.versionDetailUrl)">
                            <span class="text">{{ row.versionStatus }} </span> <OIcon><IconOutlink /></OIcon>
                          </OLink>
                        </template>
                        <template v-else>{{ row.versionStatus }}</template>
                      </template>
                      <template v-if="subItem.key === 'upVersion' || subItem.key === 'eulerVersion'">
                        <OPopover
                          v-if="row.versionDetail && row.versionDetail.length > 0 && updateVersionValue(row.versionDetail, subItem.key).length > 0"
                          :anchor="true"
                          position="top"
                          trigger="hover"
                        >
                          <template #target>
                            <p class="line-clamp">{{ updateVersionValue(row.versionDetail, subItem.key).join(', ') }}</p>
                          </template>
                          <div class="version-box">
                            <p v-for="pItem in updateVersionPkg(row.versionDetail, subItem.key)" :key="pItem.pkg">
                              {{ pItem.pkg }}
                              {{
                                updateVersionValue(row.versionDetail, subItem.key).length > 1
                                  ? subItem.key === 'upVersion'
                                    ? pItem.upVersion
                                    : pItem.eulerVersion
                                  : ''
                              }}
                            </p>
                          </div>
                        </OPopover>
                        <template v-else>-</template>
                      </template>
                    </template>
                  </el-table-column>
                </template>
                <template v-else>
                  <template v-if="item.key === 'repo'">
                    <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(SRCOPENEULER + row.repo)">
                      <span class="text">{{ row[item.key] }} </span> <OIcon><IconOutlink /></OIcon>
                    </OLink>
                  </template>
                  <template v-else-if="item.key === 'prStatus' || item.key === 'cveStatus' || item.key === 'issueStatus'">
                    <template v-if="item.key === 'cveStatus' && row.cveDetailUrl">
                      <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(row.cveDetailUrl)">
                        <span class="text">{{ row[item.key] }} </span> <OIcon><IconOutlink /></OIcon>
                      </OLink>
                    </template>
                    <template v-else-if="item.key === 'prStatus' && row.prDetailUrl">
                      <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(row.prDetailUrl)">
                        <span class="text">{{ row[item.key] }} </span> <OIcon><IconOutlink /></OIcon>
                      </OLink>
                    </template>
                    <template v-else-if="item.key === 'issueStatus' && row.issueDetailUrl">
                      <OLink color="primary" class="link-external" hover-underline @click="changeExternalDialog(row.issueDetailUrl)">
                        <span class="text">{{ row[item.key] }} </span> <OIcon><IconOutlink /></OIcon>
                      </OLink>
                    </template>
                    <template v-else>
                      {{ row[item.key] }}
                    </template>
                  </template>
                  <template v-else-if="item.key === 'status'">
                    <div class="repo-status">
                      <OTag :class="`type${repoStatusIndex(row.status)}`">{{ row.status }} </OTag>
                    </div>
                  </template>
                  <template v-else-if="item.key === 'suggestions'">
                    <template v-if="row.suggestions && row.suggestions.length > 0">
                      <p v-for="rule in row.suggestions" :key="rule">
                        {{ rule }}
                      </p>
                    </template>
                    <template v-else>-</template>
                  </template>

                  <template v-else-if="item.key === 'operation'">
                    <div class="operation-box">
                      <OLink color="primary" hover-underline @click="changeFeedback(row.repo)">反馈</OLink>
                      <OLink color="primary" hover-underline @click="changeFeedbackHistory(row.repo)">历史</OLink>
                    </div>
                  </template>
                  <template v-else>
                    {{ row[item.key] }}
                  </template>
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table>
        <AppLoading :loading="isLoading" />
      </div>
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
  </ContentWrapper>
</template>

<style scoped lang="scss">
@import '@/assets/style/category/collaboration/index.scss';
.setting-btn {
  margin-left: 16px;
  width: 40px;
  height: 40px;
  --btn-min-width: 40px;
  --btn-height: 40px;
  --btn-radius: 4px;
  background: var(--o-color-fill2);
  color: var(--o-color-info1);
  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    color: var(--o-color-info1);
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
:deep(.el-table) {
  .version-box {
    border-bottom: 1px solid var(--o-color-control4) !important;
    text-align: center;
  }
  .cell {
    color: var(--o-color-info1);
  }
  .header-cell {
    display: flex;
    align-items: center;
  }
  .version-box {
    .header-cell {
      justify-content: center;
    }
  }
  .o-icon svg {
    width: 16px;
    height: 16px;
  }
}
.version-box {
  max-width: 184px;
  max-height: 154px;
  color: var(--o-color-info1);
  overflow: hidden auto;
  word-break: break-all;
  @include scrollbar;
  @include tip1;
  p:not(:last-child) {
    margin-bottom: 2px;
  }
}
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
  .text {
    margin-top: 16px;
    color: var(--o-color-info1);
    @include text1;
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
  .platform-main-table {
    position: relative;
    &.empty {
      min-height: 250px;
      :deep(.o-layer.o-loading) {
        padding-top: 10%;
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
