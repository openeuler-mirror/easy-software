<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { OTab, OTabPane, useMessage } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { approvalColumns, applicationColumns, approvalHistoryColumns } from '@/data/todo';
import { getAdminApply, getMaintainerApply, getMaintainerRevoke, getAdminRevoke } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import Result404 from '@/components/Result404.vue';
import ApprovalTable from './ApprovalTable.vue';
import { COUNT_PAGESIZE } from '@/data/query';
import { getParamsRules } from '@/utils/common';
import type { RevokeT } from '@/@types/collaboration';

const tabList = [
  {
    id: 'application',
    label: '我的申请',
  },
  {
    id: 'approval',
    label: '待我审批',
  },
  {
    id: 'approved',
    label: '我审批过的',
  },
];

const { locale } = useLocale();
const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();
const message = useMessage();

const isAdminPermission = computed(() => userInfoStore.platformAdminPermission);
const isMaintainerPermission = computed(() => userInfoStore.platformMaintainerPermission);

// 报错提示
const isError = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const todoName = ref('formPage');
const applyId = ref();
const applyStatus = ref('');
const todoParams = computed(() => {
  return {
    name: todoName.value,
    applyIdString: applyId.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    applyStatus: applyStatus.value,
  };
});

// 我的申请数据
const applicationData = ref([]);
// 审批
const approvalData = ref([]);
// 审批历史
const approvedData = ref([]);
const isLoading = ref(false);

const activeName = ref();
const onChange = (type: string) => {
  currentPage.value = 1;
  pageSize.value = 10;

  clearFilterParams(applicationFilterParams);
  clearFilterParams(approvalFilterParams);
  clearFilterParams(approvedFilterParams);

  pageInit();
  // 切换url参数
  router.push({
    path: `/${locale.value}/todo/${type}`,
  });
};

// 清楚筛选数据
const clearFilterParams = (data: any) => {
  Object.keys(data).forEach((key) => {
    data[key] = '';
  });
};

/* ---------------分页事件------------------ */
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  pageInit();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  pageInit();
};

const applicationFilterParams = reactive({
  repo: '',
  metric: '',
  applyStatus: '',
});

// 我的申请
const queryMyApplication = async (params: Record<string, string> = {}) => {
  isLoading.value = true;
  const filterParamKeys = Object.keys(params);
  if (filterParamKeys.length && currentPage.value !== 1) {
    currentPage.value = 1;
  }
  for (const key of filterParamKeys) {
    applicationFilterParams[key as keyof typeof applicationFilterParams] = params[key];
  }
  const newData = getParamsRules(todoParams.value);

  try {
    if (isAdminPermission.value) {
      const { data } = await getAdminApply({ ...newData, ...applicationFilterParams });
      applicationData.value = data.list;
      total.value = data.total;
    } else if (isMaintainerPermission.value) {
      const { data } = await getMaintainerApply({ ...newData, ...applicationFilterParams });
      applicationData.value = data.list;
      total.value = data.total;
    }
    isLoading.value = false;
  } catch {
    applicationData.value = [];
    isError.value = true;
    isLoading.value = false;
  }
};

// 撤销申请
const revokeApplication = async (id: string) => {
  const params: RevokeT = {
    applyIdString: id,
    applyStatus: 'OPEN',
  };
  try {
    if (isAdminPermission.value) {
      const res = await getAdminRevoke(params);
      if (res.code === 200) {
        message.success({
          content: '撤销成功',
        });
        pageInit();
      }
    } else if (isMaintainerPermission.value) {
      const res = await getMaintainerRevoke(params);
      if (res.code === 200) {
        message.success({
          content: '撤销成功',
        });
        pageInit();
      }
    }
    isLoading.value = false;
  } catch {
    message.danger({
      content: '操作失败',
    });
  }
};

const approvalFilterParams = reactive({
  repo: '',
  metric: '',
});

// 待我审批
const queryApprovalApply = (params: Record<string, string> = {}) => {
  isLoading.value = true;
  if (isAdminPermission.value) {
    const filterParamKeys = Object.keys(params);
    if (filterParamKeys.length && currentPage.value !== 1) {
      currentPage.value = 1;
    }
    for (const key of filterParamKeys) {
      approvalFilterParams[key as keyof typeof approvalFilterParams] = params[key];
    }
    const newData = getParamsRules(todoParams.value);

    getAdminApply({ ...newData, ...approvalFilterParams })
      .then((res) => {
        approvalData.value = res.data.list;
        total.value = res.data.total;

        isLoading.value = false;
      })
      .catch(() => {
        approvalData.value = [];
        isError.value = true;
        isLoading.value = false;
      });
  } else {
    isError.value = true;
    isLoading.value = false;
  }
};

const approvedFilterParams = reactive({
  repo: '',
  metric: '',
});

// 我审批过的
const queryApprovedApply = (params: Record<string, string> = {}) => {
  isLoading.value = true;
  if (isAdminPermission.value) {
    const filterParamKeys = Object.keys(params);
    if (filterParamKeys.length && currentPage.value !== 1) {
      currentPage.value = 1;
    }
    for (const key of filterParamKeys) {
      approvedFilterParams[key as keyof typeof approvedFilterParams] = params[key];
    }
    const newData = getParamsRules(todoParams.value);
    getAdminApply({ ...newData, ...approvedFilterParams })
      .then((res) => {
        approvedData.value = res.data.list;
        total.value = res.data.total;
        isLoading.value = false;
      })
      .catch(() => {
        approvedData.value = [];
        isLoading.value = false;
        isError.value = true;
      });
  } else {
    isError.value = true;
    isLoading.value = false;
  }
};

const pageInit = () => {
  isError.value = false;
  if (activeName.value === 'application') {
    applyStatus.value = isAdminPermission.value ? 'OPEN,REVOKED' : '';
    todoName.value = 'formPage';
    applyId.value = '';
    queryMyApplication();
  } else if (activeName.value === 'approval') {
    todoName.value = 'formPage';
    applyStatus.value = 'OPEN';
    queryApprovalApply();
  } else if (activeName.value === 'approved') {
    todoName.value = 'formPage';
    applyStatus.value = 'APPROVED,REJECTED';
    queryApprovedApply();
  }
};

onMounted(() => {
  activeName.value = (route.params?.type as string) || 'application';
  pageInit();
});
</script>

<template>
  <div class="platform-header">
    <ContentWrapper>
      <h1>待办中心</h1>
    </ContentWrapper>
  </div>
  <OTab variant="text" @change="onChange" v-model="activeName" size="large" :style="{ '--tab-nav-justify': 'flex-start' }">
    <OTabPane v-for="item in tabList" :key="item.id" :value="item.id" :label="item.label"> </OTabPane>
  </OTab>
  <div class="todo-content">
    <AppLoading :loading="isLoading" />
    <!-- 我的申请 -->
    <div v-if="activeName === 'application' && !isError" class="application">
      <template v-if="!isLoading">
        <ApprovalTable
          :columns="applicationColumns"
          @queryData="queryMyApplication"
          :filterParams="applicationFilterParams"
          :type="activeName"
          :data="applicationData"
          :loading="isLoading"
          @revoke="revokeApplication"
        />
        <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
          <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </template>
    </div>
    <!-- 判断admin权限 -->
    <template v-if="isAdminPermission">
      <div v-if="activeName === 'approval' && !isError" class="approval">
        <template v-if="!isLoading">
          <ApprovalTable
            :columns="approvalColumns"
            @queryData="queryApprovalApply"
            :filterParams="approvalFilterParams"
            :type="activeName"
            :data="approvalData"
            :loading="isLoading"
          />
          <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </template>
      </div>
      <div v-if="activeName === 'approved' && !isError" class="approved">
        <template v-if="!isLoading">
          <ApprovalTable
            :columns="approvalHistoryColumns"
            @queryData="queryApprovedApply"
            :filterParams="approvedFilterParams"
            :type="activeName"
            :data="approvedData"
            :loading="isLoading"
          />
          <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </template>
      </div>
    </template>

    <!-- 暂无记录 -->
    <template v-if="(activeName === 'application' && isError) || (activeName === 'approval' && isError) || (activeName === 'approved' && isError)">
      <Result404>
        <template #description>
          <p class="text404">暂无{{ activeName === 'application' ? '申请' : '审批' }}记录</p>
        </template>
      </Result404>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.pagination-box {
  margin-top: 32px;
  display: flex;
  justify-content: end;
}

.platform-header {
  padding: 48px 0 24px;
  h1 {
    color: var(--o-color-info1);
    font-weight: 500;
    @include h1;
  }
}

:deep(.o-tab-navs) {
  max-width: var(--layout-content-max-width);
  padding-left: var(--layout-content-padding);
  padding-right: var(--layout-content-padding);
  margin: 0 auto;
}
:deep(.o-tab-pane) {
  max-width: var(--layout-content-max-width);
  padding-left: var(--layout-content-padding);
  padding-right: var(--layout-content-padding);
  position: relative;
}
.todo-content {
  position: relative;
  min-height: calc(var(--layout-content-min-height) - 200px);
  margin: 0 auto;
  max-width: var(--layout-content-max-width);
  padding: 24px var(--layout-content-padding) 72px;
}
.approval,
.approved {
  :deep(thead) {
    .operation {
      width: 115px;
    }
  }
}
</style>
