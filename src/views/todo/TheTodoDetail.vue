<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { OButton, OTag, OForm, OTextarea, OFormItem, useMessage, type FieldResultT } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { getAdminApply, getMaintainerApply, getAdminProcess } from '@/api/api-collaboration';
import { applicationTypeConvert, applyStatusConvert, versionLatestStatusConvert } from '@/utils/collaboration';
import { formatDateTime } from '@/utils/common';
import { useUserInfoStore } from '@/stores/user';

const route = useRoute();
const message = useMessage();
const userInfoStore = useUserInfoStore();
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);
const isMaintainerPer = computed(() => userInfoStore.platformMaintainerPermission);
const isLoading = ref(true);
const isError = ref(false);

const type = ref();
const applyId = ref((route.params.id as string) || '');
const todoData = ref();
const formRef = ref<InstanceType<typeof OForm>>();
const formData = reactive({
  applyIdString: applyId.value,
  comment: '',
  applyStatus: '',
});

// 我的申请
const queryApplicationApply = () => {
  getMaintainerApply({ name: 'formContent', applyIdString: applyId.value })
    .then((res) => {
      todoData.value = res.data.list[0];
      isLoading.value = false;
    })
    .catch(() => {
      isError.value = true;
      isLoading.value = false;
    });
};

// 待我审批
const queryApprovalApply = () => {
  getAdminApply({ name: 'formContent', applyIdString: applyId.value })
    .then((res) => {
      todoData.value = res.data.list[0];

      isLoading.value = false;
    })
    .catch(() => {
      isError.value = true;
      isLoading.value = false;
    });
};

// --------------------审批开始------------------------

// 审批意见验证
const commentRules = [
  {
    required: true,
    triggers: ['blur'],
    message: '请输入审批意见',
    validator: (value: string) => {
      if (value.length > 1000) {
        return {
          type: 'danger',
          message: '最多不能超过1000字',
        };
      }
    },
  },
];

// 通过
const onSubmit = (results: FieldResultT[]) => {
  if (results.find((item) => item?.type === 'danger')) {
    return;
  } else {
    formData.applyStatus = 'APPROVED';
    queryAdminProcess();
  }
};

// 驳回
const rejected = async () => {
  const items = await formRef.value?.validate();
  if (items?.find((item) => item?.type === 'danger')) {
    return;
  }
  formData.applyStatus = 'REJECTED';
  queryAdminProcess();
};

const queryAdminProcess = () => {
  getAdminProcess(formData)
    .then((res) => {
      if (res.code === 200) {
        message.success({
          content: '审批成功',
        });
        formRef.value?.resetFields();
        queryApprovalApply();
      }
    })
    .catch(() => {
      message.danger({
        content: '审批失败',
      });
      formRef.value?.resetFields();
    });
};

// --------------------审批结束------------------------

onMounted(() => {
  type.value = route.params.type;
  if (type.value === 'application') {
    queryApplicationApply();
  } else if (type.value === 'approval' || type.value === 'approved') {
    queryApprovalApply();
  }
});
</script>

<template>
  <ContentWrapper verticalPadding="32px">
    <AppLoading :loading="isLoading" />
    <CBreadcrumb :type="type" :repo="todoData?.repo" />
    <div v-if="todoData" class="todo-detail">
      <div class="title">
        <h2>{{ todoData.repo }}</h2>
        <div class="apply-status">
          <OTag :class="todoData.applyStatus.toLocaleLowerCase()">{{ applyStatusConvert(todoData.applyStatus) }} </OTag>
        </div>
      </div>

      <h3 class="caption">基本信息</h3>
      <OForm label-width="92px" label-align="top">
        <OFormItem label="申请单号：">
          {{ todoData.applyIdString }}
        </OFormItem>
        <OFormItem label="申请类型：">
          {{ applicationTypeConvert(todoData.metric) }}
        </OFormItem>
        <OFormItem label="修改状态："> {{ versionLatestStatusConvert(todoData.metricStatus) }} </OFormItem>
        <OFormItem label="修改理由：">{{ todoData.description }} </OFormItem>
        <OFormItem label="申请时间："> {{ formatDateTime(todoData.createdAt, true) }} </OFormItem>
      </OForm>

      <template v-if="isMaintainerPer || todoData.applyStatus === 'REJECTED' || todoData.applyStatus === 'APPROVED'">
        <h3 class="caption">审批信息</h3>
        <OForm label-width="92px" label-align="top">
          <OFormItem label="审批人：">
            {{ todoData.administrator ?? ' -' }}
          </OFormItem>
          <OFormItem label="审批意见：">
            {{ todoData.comment ?? ' -' }}
          </OFormItem>
          <OFormItem label="审批时间："> {{ formatDateTime(todoData.approvalTime, true) ?? ' -' }} </OFormItem>
        </OForm>
      </template>
      <template v-if="isAdminPer && todoData.applyStatus === 'OPEN'">
        <h3 class="caption">审批</h3>
        <OForm ref="formRef" has-required :model="formData" label-width="92px" label-align="top" @submit="onSubmit">
          <OFormItem label="审批意见：" required field="comment" :rules="commentRules">
            <OTextarea
              v-model="formData.comment"
              :max-length="1000"
              placeholder="请输入审批意见"
              resize="none"
              :rows="4"
              :input-on-outlimit="false"
              style="width: 480px"
            ></OTextarea>
          </OFormItem>
          <div class="button-box">
            <OButton variant="solid" color="primary" size="large" type="submit">通过</OButton>
            <OButton variant="outline" color="primary" size="large" class="reset" @click="rejected">驳回</OButton>
          </div>
        </OForm>
      </template>
    </div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';
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
  .caption {
    color: var(--o-color-info1);
    margin: 24px 0 16px;
    font-weight: 500;
    @include h4;
  }
  :deep(.o-form) {
    --form-item-gap: 16px;
    --form-label-gap-top: 0;
    --form-label-main-gap: 24px;
    .o-form-item-main-wrap {
      min-height: 24px;
    }
    color: var(--o-color-info1);
    @include text1;
  }

  .button-box {
    display: flex;
    margin-top: 32px;
    .o-btn + .o-btn {
      margin-left: 24px;
    }
  }
}
</style>
