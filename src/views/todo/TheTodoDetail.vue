<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OButton, OTag, OTextarea } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { getAdminRecords, getMaintainerApply } from '@/api/api-collaboration';
import { applyStatus } from '@/data/todo';
import { formatDateTime } from '@/utils/common';

const route = useRoute();
const router = useRouter();

const type = ref();
const applyId = ref(Number(route.params.id) || 0);
const todoData = ref();

// 我的申请
const queryApplicationApply = () => {
  getMaintainerApply({ name: 'formContent', applyId: applyId.value }).then((res) => {
    todoData.value = res.data.list[0];
  });
};

// 待我审批
const queryApprovalApply = () => {
  getAdminRecords(applyId.value).then((res) => {
    todoData.value = res.data.list[0];
  });
};

onMounted(() => {
  type.value = route.params.type;
  if (type.value === 'application') {
    queryApplicationApply();
  } else if (type.value === 'approval') {
    queryApprovalApply();
  }
});
</script>

<template>
  <ContentWrapper verticalPadding="32px">
    <CBreadcrumb :type="type" :repo="todoData?.repo" />
    <div v-if="todoData" class="todo-detail">
      <div class="title">
        <h2>{{ todoData.repo }}</h2>
        <OTag class="app-tag" :class="todoData.applyStatus.toLocaleLowerCase()">{{ applyStatus[todoData.applyStatus] }} </OTag>
      </div>
      <dl>
        <dt>基本信息</dt>
        <dd><span class="label">申请单号：</span>{{ todoData.applyId }}</dd>
        <dd><span class="label">申请类型：</span>{{ todoData.metric }}</dd>
        <dd><span class="label">修改状态：</span>{{ todoData.metricStatus }}</dd>
        <dd><span class="label">修改理由：</span>{{ todoData.description }}</dd>
        <dd><span class="label">申请时间：</span>{{ formatDateTime(todoData.updateAt) }}</dd>
      </dl>
      <dl>
        <dt>审批信息</dt>
        <dd><span class="label">审批人：</span>{{ todoData.adminstrator }}</dd>
        <dd>
          <span class="label">审批意见：</span>
        </dd>
        <dd>
          <span class="label">审批时间：</span>
        </dd>
      </dl>
      <dl>
        <dt>审批</dt>
        <dd>
          <span class="label">审批意见：</span>
          <OTextarea></OTextarea>
        </dd>
        <dd>
          <OButton variant="solid" color="primary">通过</OButton>
          <OButton color="primary">驳回</OButton>
        </dd>
      </dl>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.todo-detail {
  padding: 32px 40px;
  background: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
  margin: 24px 0 0;
  min-height: calc(var(--layout-content-min-height) - 24px);
  .title {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    h2 {
      color: var(--o-color-info1);
      font-weight: 500;
      margin-right: 16px;
      @include h3;
    }
  }
  dt {
    color: var(--o-color-info1);
    margin-top: 24px;
    font-weight: 500;
    @include h4;
  }
  dd {
    color: var(--o-color-info1);
    display: flex;
    margin-top: 16px;
    @include text1;
    .label {
      min-width: 80px;
      margin-right: 24px;
    }
  }
}

.app-tag {
  min-width: 72px;
  color: var(--o-color-white);
  &.pendding {
    --tag-bg-color: var(--o-color-warning1);
    --tag-bd-color: var(--o-color-warning1);
  }
  &.passed {
    --tag-bg-color: var(--o-color-success1);
    --tag-bd-color: var(--o-color-success1);
  }
  &.revoked {
    --tag-bg-color: var(--o-color-control1);
    --tag-bd-color: transparent;
  }

  &.dismissed {
    --tag-bg-color: var(--o-color-danger1);
    --tag-bd-color: var(--o-color-danger1);
  }
}
</style>
