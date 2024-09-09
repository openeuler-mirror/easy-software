<script lang="ts" setup>
import { ref } from 'vue';
import { OLink } from '@opensig/opendesign';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { GITEE } from '@/data/config';
import ExternalLink from '@/components/ExternalLink.vue';
import Result404 from '@/components/Result404.vue';

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
});

const route = useRoute();
const { t } = useI18n();

const searchVal = ref(decodeURIComponent(route.query.name as string));

// 一键反馈
const getIssueTemplate = () => {
  return `1. 【网站链接】%0A
> ${encodeURIComponent(window.location.href)}
%0A
2. 【反馈内容】%0A
> ${searchVal.value}
`;
};
const issueUrl = ref();
const getIssueUrl = () => {
  const desc = encodeURIComponent(getIssueTemplate());
  issueUrl.value = `${GITEE}/openeuler/easy-software/issues/new?issue%5Bassignee_id%5D=0&issue%5Bmilestone_id%5D=0&title=【搜索】-${props.type}-${searchVal.value}&description=${desc}`;
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const clickFeedback = () => {
  getIssueUrl();
  externalLink.value = decodeURIComponent(issueUrl.value);
  showExternalDlg.value = true;
};
</script>

<template>
  <Result404 class="result-tips">
    <template #description>
      <p class="text">
        {{ t('software.nofoundApp') }} <OLink hover-underline color="primary" @click="clickFeedback">{{ t('software.feedbackPkg.btn') }}</OLink>
      </p>
    </template>
  </Result404>

  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
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
