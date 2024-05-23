<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { OLink, OTag, OPopover, OResult, OFigure, useMessage, vLoading } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { postFeedback } from '@/api/api-feedback';

import result404 from '@/assets/404.png';

const props = defineProps({
  type: {
    type: String,
    default: 'nofound',
  },
});

const route = useRoute();
const { t } = useI18n();
const message = useMessage();
const state = ref(props.type);

const feedbackRef = ref(null);
const searchVal = ref(decodeURIComponent(route.params.id as string));
const isLoading = ref(false);

// 一键反馈
const clickFeedback = () => {
  const params = {
    feedbackPageUrl: window.location.href,
    feedbackText: searchVal.value,
    feedbackValue: 0,
  };
  isLoading.value = true;
  postFeedback(params)
    .then((res) => {
      if (res.code === 200) {
        isLoading.value = false;
        message.success({
          content: t('software.feedbackSuccess'),
        });
        state.value = 'feedback';
      }
    })
    .catch(() => {
      isLoading.value = false;
      message.success({
        content: t('software.feedbackWarning'),
      });
    });
};
const tabName = ref('');
onMounted(() => {
  tabName.value = route.query?.tab as string;
});
</script>

<template>
  <OResult v-loading="isLoading" class="result-tips" :class="tabName">
    <template #image>
      <OFigure :src="result404" fit="contain" />
    </template>
    <template #description>
      <div v-if="state === 'nofound'">
        {{ t('software.nofoundApp') }}
        <OLink hover-underline color="primary" @click="clickFeedback">{{ t('software.feedbackPkg.btn') }}</OLink>
      </div>
      <div v-else>
        {{ t('software.feedbackPkg.text') }} <OLink ref="feedbackRef" hover-underline color="primary">{{ t('software.feedbackPkg.schedule') }}</OLink>

        <OPopover position="right" :target="feedbackRef" trigger="click" :unmount-on-hide="false">
          <p class="text">{{ t('software.feedbackPkg.name') }}：{{ searchVal }}</p>
          <p class="text">{{ t('software.feedbackPkg.state') }}：<OTag color="success">{{ t('software.feedbackPkg.online') }}</OTag></p>
        </OPopover>
      </div>
    </template>
  </OResult>
</template>

<style lang="scss" scoped>
.result-tips {
  background: var(--o-color-fill2);
  min-height: 300px;
  text-align: center;
  padding: 40px;
  box-shadow: var(--o-shadow-1);
  flex: 1;
}
.text {
  @include text1;
  color: var(--o-color-info1);
}
</style>
