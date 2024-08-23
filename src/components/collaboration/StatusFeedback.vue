<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ODialog, OButton, OForm, OTextarea, OFormItem, ORadioGroup, ORadio, OSelect, OOption, type FieldResultT, useMessage } from '@opensig/opendesign';

import { getApplyFeedback } from '@/api/api-collaboration';
import { applicationType } from '@/data/todo/';

const props = defineProps({
  repo: {
    type: String,
    default: () => '',
  },
});

const showDlg = ref(true);
const message = useMessage();

const formRef = ref<InstanceType<typeof OForm>>();
const formData = reactive({
  repo: props.repo,
  metric: '',
  metricStatus: '',
  description: '',
  applyStatus: 'OPEN',
});

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const metricIndex = ref(-1);
const onChangeRadio = (v: string) => {
  formData.metricStatus = '';
  metricIndex.value = applicationType.findIndex((item) => item.id === v);
};
// 根据状态获取
const metricCategory = computed(() => (metricIndex.value === -1 ? [] : applicationType[metricIndex.value].children));

// 重置表单数据
const reset = () => {
  formRef.value?.resetFields();
  emits('close');
};

const onChange = () => {
  emits('close');
};

// 验证
const metricRules = [
  {
    required: true,
    message: '请选择您要修改的状态类别',
    triggers: ['blur'],
  },
];

const modifyRules = [
  {
    required: true,
    message: '请选择修改状态',
    triggers: ['blur'],
  },
];

const descriptionRules = [
  {
    required: true,
    triggers: ['blur'],
    message: '请输入您的理由',
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

const onSubmit = (results: FieldResultT[]) => {
  if (results.find((item) => item?.type === 'danger')) {
    return;
  } else {
    getApplyFeedback(formData)
      .then((res) => {
        if (res.code === 200) {
          message.success({
            content: '反馈成功',
          });
          showDlg.value = false;
          emits('close');
        }
      })
      .catch(() => {
        message.danger({
          content: '操作失败',
        });
        showDlg.value = false;
      });
  }
};
</script>

<template>
  <ODialog v-model:visible="showDlg" :unmount-on-hide="true" @change="onChange" size="large">
    <template #header>
      <p class="title">状态反馈</p>
    </template>
    <div class="indicators">
      <OForm ref="formRef" has-required :model="formData" label-width="220px" label-align="top" @submit="onSubmit">
        <OFormItem label="请选择您要修改的状态类别" required field="metric" :rules="metricRules">
          <ORadioGroup class="metric-options" v-model="formData.metric" direction="v" @change="(v) => onChangeRadio(v)">
            <ORadio v-for="option in applicationType" :key="option.label" :value="option.id">
              {{ option.label }}
            </ORadio>
          </ORadioGroup>
        </OFormItem>
        <OFormItem label="修改状态" required field="metricStatus" :rules="modifyRules">
          <OSelect v-model="formData.metricStatus" size="large" style="width: 100%">
            <OOption v-for="item in metricCategory" :key="item" :label="item" :value="item" />
          </OSelect>
        </OFormItem>
        <OFormItem label="修改理由" required field="description" :rules="descriptionRules">
          <OTextarea
            v-model="formData.description"
            :max-length="1000"
            placeholder="请输入您的理由"
            resize="none"
            :rows="4"
            :input-on-outlimit="false"
            style="width: 100%"
          >
          </OTextarea>
        </OFormItem>
        <div class="button-box">
          <OButton variant="solid" color="primary" size="large" type="submit">提交反馈</OButton>
          <OButton variant="outline" color="primary" size="large" class="reset" @click="reset">取消</OButton>
        </div>
      </OForm>
    </div>
  </ODialog>
</template>

<style lang="scss" scoped>
.metric-options {
  --radio-group-gap: 12px;
}
.button-box {
  display: flex;
  justify-content: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
}

:deep(.o-form) {
  color: var(--o-color-info1);
}
</style>
