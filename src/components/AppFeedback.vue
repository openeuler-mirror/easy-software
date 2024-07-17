<script lang="ts" setup>
import { ref } from 'vue';
import { ORate, OTextarea, useMessage, OIcon, OButton } from '@opensig/opendesign';
import { GITEE } from '@/data/config';
import { useI18n } from 'vue-i18n';
import { OPENEULER_FORUM } from '@/data/config';
import { postFeedback } from '@/api/api-feedback';

import xss from 'xss';
import ExternalLink from '@/components/ExternalLink.vue';
import AppSection from '@/components/AppSection.vue';

import IconHelp from '~icons/pkg/icon-help.svg';
import IconIssue from '~icons/pkg/icon-issue.svg';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  version: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();

// -------------------- 快速反馈 --------------------
const rateVal = ref(0);
const feedbackTxa = ref('');
const message = useMessage();

const clickSubmit = () => {
  if (rateVal.value === 0) {
    return message.warning({
      content: t('software.feedbackMessage[1]'),
    });
  } else if (feedbackTxa.value === '') {
    return message.warning({
      content: t('software.feedbackMessage[0]'),
    });
  }

  const params = {
    feedbackPageUrl: window.location.href,
    feedbackText: xss(feedbackTxa.value),
    feedbackValue: rateVal.value,
  };

  if (feedbackTxa.value.includes('$')) {
    return message.warning({
      content: `非法字符，请重新输入`,
    });
  }
  postFeedback(params)
    .then((res) => {
      if (res.code === 200) {
        message.success({
          content: t('software.feedbackSuccess'),
        });
        clearData();
      } else {
        message.warning({
          content: t('software.feedbackWarning'),
        });
      }
    })
    .catch(() => {});
};

const clearData = () => {
  feedbackTxa.value = '';
  rateVal.value = 0;
};

// -------------------- 提交issue --------------------
const getIssueTemplate = () => {
  return `1. 【网站链接】%0A
> ${encodeURIComponent(window.location.href)}
%0A
2. 【反馈评分】%0A
> ${rateVal.value}
%0A
3. 【反馈意见】%0A
> ${xss(feedbackTxa.value)}
`;
};
const issueUrl = ref();

const getIssueUrl = () => {
  const desc = encodeURIComponent(getIssueTemplate());
  issueUrl.value = `${GITEE}/openeuler/easy-software/issues/new?issue%5Bassignee_id%5D=0&issue%5Bmilestone_id%5D=0&title=【${props.type}】-${props.name}-${props.version}&description=${desc}`;
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = () => {
  if (rateVal.value === 0) {
    return message.warning({
      content: t('software.feedbackMessage[1]'),
    });
  } else if (feedbackTxa.value === '') {
    return message.warning({
      content: t('software.feedbackMessage[0]'),
    });
  }

  getIssueUrl();
  externalLink.value = decodeURIComponent(issueUrl.value);
  showExternalDlg.value = true;
};
</script>

<template>
  <AppSection :title="t('software.feedbackTitle')" class="feedback">
    <div class="feedback-content">
      <div class="rate-box">
        <ORate v-model="rateVal" color="primary" size="large" />
      </div>
      <div class="feedback-from">
        <OTextarea
          v-model="feedbackTxa"
          round="4px"
          :placeholder="t('software.feedbackPlaceholder')"
          :max-length="200"
          :input-on-outlimit="false"
          resize="none"
          :rows="4"
          :clearable="false"
          style="width: 100%"
        />
        <div class="action">
          <OButton color="primary" variant="solid" size="large" @click="clickSubmit">{{ t('software.feedbackButton[0]') }}</OButton>
        </div>
        <p class="other-text">其他反馈方式</p>
        <div class="feedback-other">
          <a @click="onExternalDialog()">
            <OIcon><IconIssue /></OIcon>提交issue
          </a>
          <a :href="OPENEULER_FORUM" target="_blank" rel="noopener noreferrer">
            <OIcon><IconHelp /></OIcon>发帖求助
          </a>
        </div>
      </div>
    </div>
  </AppSection>
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
.other-text {
  margin: 32px 0 16px;
  @include text1;
  color: var(--o-color-info1);
  font-weight: 500;
}
.feedback-other {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  a + a {
    margin-left: 24px;
  }
  a {
    @include text1;
    color: var(--o-color-info1);
    line-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--o-kleinblue-6), 0.05);
    border-radius: 4px;
    transition: all var(--o-duration-s) var(--o-easing-standard);
    .o-icon {
      font-size: 32px;
      margin-right: 12px;
      color: var(--o-color-info2);
      svg {
        width: 32px;
        height: 32px;
      }
    }
    &:hover {
      background: var(--o-color-primary4-light);
    }
  }
}
.feedback-from {
  .o-textarea {
    margin: 16px 0 0;
  }
  .text {
    @include tip1;
    color: var(--o-color-info2);
  }
  .action {
    display: flex;
    align-items: center;
    margin-top: 24px;
  }
}
:deep(.o-rate) {
  --rate-size: 24px;
}
</style>
