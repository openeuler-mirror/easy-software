<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { OTab, OTabPane, useMessage } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { approvalColumns, applicationColumns, approvalHistoryColumns } from '@/data/todo';
import { getCollaborationApply, getTodoRevoke } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import Error404Result from '@/components/Error404Result.vue';
import ApprovalTable from './ApprovalTable.vue';
import { COUNT_PAGESIZE } from '@/data/query';
import { getParamsRules } from '@/utils/common';
import type { RevokeT, AdminAppryT } from '@/@types/collaboration';

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
const applyStatus = ref('');

const todoParams = computed(() => {
  return {
    name: todoName.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    applyStatus: applyStatus.value,
  };
});

const applicationFilterParams = reactive({
  repo: '',
  metric: '',
  applyStatus: '',
});

const approvalFilterParams = reactive({
  repo: '',
  metric: '',
});

const approvedFilterParams = reactive({
  repo: '',
  metric: '',
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
  pageInit();
  // 切换url参数
  router.push({
    path: `/${locale.value}/todo/${type}`,
  });
};

const pageInit = () => {
  if (activeName.value === 'application' && isMaintainerPermission.value) {
    clearFilterParams(applicationFilterParams);
    queryTodoData();
    isNotData.value = true;
  } else if (isAdminPermission.value) {
    clearFilterParams(approvalFilterParams);
    clearFilterParams(approvedFilterParams);
    queryTodoData();
    isNotData.value = true;
  } else {
    isError.value = true;
    isNotData.value = false;
  }
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
  queryTodoData();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  queryTodoData();
};

const queryTodoApply = async (paramsObj: AdminAppryT) => {
  let resData = [];
  let totalNum: number = 0;
  if (isAdminPermission.value) {
    const { data } = await getCollaborationApply(paramsObj, 'admin');
    resData = data.list;
    totalNum = data.total;
  } else if (isMaintainerPermission.value) {
    const { data } = await getCollaborationApply(paramsObj, 'maintainer');
    resData = data.list;
    totalNum = data.total;
  }

  return { resData, totalNum };
};

const isNotData = ref(true);
// 数据处理
const queryTodoData = async (params: Record<string, string> = {}) => {
  isLoading.value = true;
  isError.value = false;

  const filterParamKeys = Object.keys(params);
  // 重置分页
  if (filterParamKeys.length && currentPage.value !== 1) {
    currentPage.value = 1;
  }

  let filterParams = {};
  if (activeName.value === 'application') {
    applyStatus.value = isAdminPermission.value ? 'OPEN,REVOKED' : '';
    if (filterParamKeys.length) {
      for (const key of filterParamKeys) {
        applicationFilterParams[key as keyof typeof applicationFilterParams] = params[key];
      }
      // 如果申请状态有值就重置
      applyStatus.value = applicationFilterParams.applyStatus;
    }
    filterParams = { ...applicationFilterParams };
  } else if (activeName.value === 'approval') {
    for (const key of filterParamKeys) {
      approvalFilterParams[key as keyof typeof approvalFilterParams] = params[key];
    }
    filterParams = { ...approvalFilterParams };
    applyStatus.value = 'OPEN';
  } else if (activeName.value === 'approved') {
    for (const key of filterParamKeys) {
      approvedFilterParams[key as keyof typeof approvedFilterParams] = params[key];
    }
    filterParams = { ...approvedFilterParams };
    applyStatus.value = 'APPROVED,REJECTED';
  }

  const paramsObj = { ...getParamsRules(filterParams), ...getParamsRules(todoParams.value) };

  try {
    queryTodoApply(paramsObj).then((res) => {
      const { resData, totalNum } = res;
      if (activeName.value === 'approval') {
        approvalData.value = resData;
      } else if (activeName.value === 'approved') {
        approvedData.value = resData;
      } else if (activeName.value === 'application') {
        applicationData.value = resData;
      }
      isLoading.value = false;
      if (resData.length > 0) {
        isNotData.value = false;
      }
      if (resData.length === 0 && filterParamKeys.length === 0) {
        isError.value = true;
        isNotData.value = false;
      }

      total.value = totalNum;
    });
  } catch {
    applicationData.value = [];
    approvalData.value = [];
    approvedData.value = [];
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
      const res = await getTodoRevoke(params, 'admin');
      if (res.code === 200) {
        message.success({
          content: '撤销成功',
        });
        queryTodoData();
      }
    } else if (isMaintainerPermission.value) {
      const res = await getTodoRevoke(params, 'maintainer');
      if (res.code === 200) {
        message.success({
          content: '撤销成功',
        });
        queryTodoData();
      }
    }
    isLoading.value = false;
  } catch {
    message.danger({
      content: '操作失败',
    });
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
    <div class="todo-content-table" :class="isNotData ? 'empty' : ''">
      <template v-if="isAdminPermission || (isMaintainerPermission && activeName === 'application')">
        <AppLoading :loading="isLoading" />
        <!-- 我的申请 -->
        <ApprovalTable
          v-if="activeName === 'application' && !isError"
          :columns="applicationColumns"
          @queryData="queryTodoData"
          :filterParams="applicationFilterParams"
          :type="activeName"
          :data="applicationData"
          @revoke="revokeApplication"
        />
      </template>
      <!-- 判断admin权限 -->
      <template v-if="isAdminPermission">
        <AppLoading :loading="isLoading" />
        <ApprovalTable
          v-if="activeName === 'approval' && !isError"
          :columns="approvalColumns"
          @queryData="queryTodoData"
          :filterParams="approvalFilterParams"
          :type="activeName"
          :data="approvalData"
        />
        <ApprovalTable
          v-if="activeName === 'approved' && !isError"
          :columns="approvalHistoryColumns"
          @queryData="queryTodoData"
          :filterParams="approvedFilterParams"
          :type="activeName"
          :data="approvedData"
        />
      </template>
    </div>
    <div v-if="total > COUNT_PAGESIZE[0] && !isError" class="pagination-box">
      <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <!-- 暂无记录 -->
    <template v-if="(activeName === 'application' && isError) || (activeName === 'approval' && isError) || (activeName === 'approved' && isError)">
      <Error404Result>
        <template #description>
          <p class="text404">暂无{{ activeName === 'application' ? '申请' : '审批' }}记录</p>
        </template>
      </Error404Result>
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
  min-height: calc(var(--layout-content-min-height) - 200px);
  margin: 24px auto 72px;
  max-width: calc(var(--layout-content-max-width) - var(--layout-content-padding) * 2);
  .todo-content-table {
    position: relative;
    &.empty {
      min-height: 250px;
      :deep(.o-layer.o-loading) {
        padding-top: 10%;
      }
    }
  }
}
</style>
