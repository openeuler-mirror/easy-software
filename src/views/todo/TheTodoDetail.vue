<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { OButton, OTag, OForm, OTextarea, OFormItem, useMessage, type FieldResultT, ODialog, OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';
import { useRoute, useRouter } from 'vue-router';
import { getAdminApply, getMaintainerApply, getAdminProcess } from '@/api/api-collaboration';
import { applicationTypeConvert, applyStatusConvert, versionLatestStatusConvert } from '@/utils/collaboration';
import { formatDateTime } from '@/utils/common';
import { useUserInfoStore } from '@/stores/user';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const { locale } = useLocale();
const { t } = useI18n();

const userInfoStore = useUserInfoStore();
const isAdminPer = computed(() => userInfoStore.platformAdminPermission);
const isMaintainerPer = computed(() => userInfoStore.platformMaintainerPermission);
const getGiteeId = computed(() => userInfoStore.getGiteeId);

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
const queryApplicationApply = async () => {
  try {
    if (isAdminPer.value) {
      const { data } = await getAdminApply({ name: 'formContent', applyIdString: applyId.value });
      todoData.value = data.list[0];
    } else if (isMaintainerPer.value) {
      const { data } = await getMaintainerApply({ name: 'formContent', applyIdString: applyId.value });
      todoData.value = data.list[0];
    }

    isLoading.value = false;
  } catch {
    isError.value = true;
    isLoading.value = false;
  }
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
  },
  {
    validator: (value: string) => {
      if (value.trim().length < 1 || value.length > 1000) {
        return {
          type: 'danger',
          message: '长度为1-1000个字符',
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
// 审批
const queryAdminProcess = () => {
  //不能审批自己提的反馈
  if (getGiteeId.value === todoData.value.maintainer) {
    return message.warning({
      content: '不能审批自己提的反馈!',
    });
  }

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
const showDlg = ref(false);
const showHref = ref('');
const jump = (path: string) => {
  if (formData.comment.trim().length > 0) {
    showDlg.value = true;
    showHref.value = path;
  } else {
    router.push(path);
  }
};

const confirmExit = () => {
  showDlg.value = false;
  router.push(showHref.value);
};

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
  <ContentWrapper :verticalPadding="['32px', '72px']">
    <AppLoading :loading="isLoading" />
    <OBreadcrumb class="app-breadcrumb">
      <OBreadcrumbItem @click="jump(`/${locale}/todo/${isMaintainerPer ? 'application' : 'approval'}`)">待办中心</OBreadcrumbItem>
      <OBreadcrumbItem @click="jump(`/${locale}/todo/${type}`)">{{ t(`collaboration.${type}`) }}</OBreadcrumbItem>
      <OBreadcrumbItem>{{ todoData?.repo }} </OBreadcrumbItem>
    </OBreadcrumb>
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
              :clearable="false"
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

    <!--退出弹窗 -->
    <ODialog v-model:visible="showDlg" :unmount-on-hide="true" :mask="true" size="small">
      <template #header>
        <p class="title">确认退出</p>
      </template>
      <p class="revoke-text">退出后输入内容将会丢失，确认是否退出？</p>
      <template #footer>
        <div class="dlg-action">
          <OButton variant="outline" size="large" color="primary" class="upload" @click="confirmExit">确认</OButton>
          <OButton variant="solid" size="large" color="primary" class="upload" @click="showDlg = false">取消</OButton>
        </div>
      </template>
    </ODialog>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/collaboration/index.scss';
.revoke-text {
  text-align: center;
}
.dlg-action {
  display: flex;
  justify-content: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
}

.todo-detail {
  padding: 32px 40px;
  background: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
  margin: 24px 0 0;
  min-height: calc(var(--layout-content-min-height) - 154px);
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
