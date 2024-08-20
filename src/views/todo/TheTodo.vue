<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { OTab, OTabPane, useMessage } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { approvalColumns, applicationColumns } from '@/data/todo';
import { getAdminApply, getMaintainerApply, getMaintainerRevoke } from '@/api/api-collaboration';
import { useUserInfoStore } from '@/stores/user';
import Result404 from '@/components/Result404.vue';
import ApprovalTable from './ApprovalTable.vue';
import { COUNT_PAGESIZE } from '@/data/query';

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
    id: 'approval-history',
    label: '我审批过的',
  },
];

const { locale } = useLocale();
const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();
const message = useMessage();

const isAdminPermission = computed(() => userInfoStore.platformAdminPermission);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const todoName = ref('formPage');
const applyId = ref();
const isError = ref(false);

const todoParams = computed(() => {
  return {
    name: todoName.value,
    applyId: applyId.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  };
});

// 我的申请数据
const applicationData = ref([]);
// 审批
const approvalData = ref([]);
// 审批历史
const approvalHistoryData = ref([]);
const isLoading = ref(false);

const activeName = ref();
const onChange = (type: string) => {
  // 切换url参数
  router.push({
    path: `/${locale.value}/todo/${type}`,
  });
};

/* ---------------分页事件------------------ */
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 我的申请
const queryMyApplication = () => {
  getMaintainerApply({ name: todoName.value })
    .then((res) => {
      applicationData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    })
    .catch(() => {
      isLoading.value = false;
      isError.value = true;
    });
};

const revokeApplication = (applyId: number) => {
  getMaintainerRevoke(applyId)
    .then((res) => {
      if (res.code === 200) {
        message.success({
          content: '撤销成功',
        });
      }
    })
    .catch(() => {
      message.danger({
        content: '操作失败',
      });
    });
};

// 待我审批
const queryApprovalApply = () => {
  if (isAdminPermission.value) {
    getAdminApply({ name: todoName.value })
      .then((res) => {
        approvalData.value = res.data.list;
        total.value = res.data.total;
        isLoading.value = false;
      })
      .catch(() => {
        isError.value = true;
      });
  }
};

const pageInit = () => {
  isLoading.value = true;
  if (activeName.value === 'application') {
    queryMyApplication();
  } else if (activeName.value === 'approval') {
    queryApprovalApply();
  }
};

onMounted(() => {
  activeName.value = (route.params?.type as string) || 'application';
  pageInit();
});

watch(
  () => route.params.type as string,
  (v: string) => {
    activeName.value = v || 'application';
    pageInit();
  }
);
</script>

<template>
  <div class="platform-header">
    <ContentWrapper>
      <h1>待办中心</h1>
    </ContentWrapper>
  </div>
  <OTab variant="text" @change="onChange" v-model="activeName" size="large" :style="{ '--tab-nav-justify': 'flex-start' }">
    <OTabPane class="tab-pane" v-for="item in tabList" :key="item.id" :value="item.id" :label="item.label">
      <!-- 我的申请 -->
      <template v-if="item.id === 'application' && applicationData.length > 0">
        <ApprovalTable :columns="applicationColumns" :type="item.id" :data="applicationData" :loading="isLoading" @revoke="revokeApplication" />
        <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
          <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </template>
      <!-- 判断admin权限 -->
      <template v-if="isAdminPermission">
        <template v-if="item.id === 'approval' && approvalData.length > 0">
          <ApprovalTable :columns="approvalColumns" :type="item.id" :data="approvalData" :loading="isLoading" />
          <div v-if="total > COUNT_PAGESIZE[0]" class="pagination-box">
            <AppPagination :current="currentPage" :pagesize="pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </template>
        <template v-if="item.id === 'approvalHistory' && approvalHistoryData.length > 0">approvalHistoryData {{ approvalHistoryData.length }} </template>
      </template>

      <!-- 暂无记录 -->
      <template v-if="(item.id === 'application' && isError) || (item.id === 'approval' && isError) || (item.id === 'approvalHistory' && isError)">
        <Result404>
          <template #description>
            <p class="text404">暂无{{ item.id === 'application' ? '申请' : '审批' }}记录</p>
          </template>
        </Result404>
      </template>
    </OTabPane>
  </OTab>
</template>

<style lang="scss" scoped>
.loading-box {
  position: relative;
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
  margin: 24px auto;
}
</style>
