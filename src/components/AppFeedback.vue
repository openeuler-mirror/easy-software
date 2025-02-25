<script lang="ts" setup>
import { inject, ref, type Ref } from 'vue';
import { ORate, OTextarea, useMessage, OIcon, OButton, ODivider, OPopover } from '@opensig/opendesign';
import { GITEE } from '@/data/config';
import { useI18n } from 'vue-i18n';
import { OPENEULER_FORUM } from '@/data/config';
import { postFeedback } from '@/api/api-feedback';
import { pkgIdInjection } from '@/data/injectionKeys';

import xss from 'xss';
import ExternalLink from '@/components/ExternalLink.vue';
import AppSection from '@/components/AppSection.vue';

import IconHelp from '~icons/pkg/icon-help.svg';
import IconHelpTips from '~icons/app/icon-help.svg';
import IconIssue from '~icons/pkg/icon-issue.svg';
import FeedbackHistory from '@/components/feedbackHistory/FeedbackHistory.vue';

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
  maintainer: {
    type: Object,
    default: () => ({
      maintainerEmail: '',
      maintainerGiteeId: '',
    }),
  },
  srcRepo: {
    type: String,
    default: '',
  },
  /**
   * 如果是在领域应用详情内，当前反馈历史列表所属的tab是哪一个
   */
  fieldDetailTab: {
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
    maintainer: props.maintainer?.maintainerGiteeId,
    maintainerEmail: props.maintainer?.maintainerEmail,
    srcRepo: props.srcRepo,
    name: props.name,
    type: props.type,
    version: props.version,
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
  issueUrl.value = `${GITEE}/openeuler/easy-software/issues/new?issue%5Bassignee_id%5D=0&issue%5Bmilestone_id%5D=0&title=【EasySoftware】【${props.type}】${props.name}-${props.version}&description=${desc}`;
};

let clearDataAfterJump = false;
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
  clearDataAfterJump = true;
};

const goToFeedbackDetailUrl = (url: string) => {
  externalLink.value = decodeURIComponent(url);
  showExternalDlg.value = true;
  clearDataAfterJump = false;
};

// 跳出本站点 清空数据
const jumpOut = () => {
  showExternalDlg.value = false;
  if (clearDataAfterJump) {
    clearData();
  }
};
</script>

<template>
  <AppSection :title="t('software.feedbackTitle')" class="feedback">
    <div class="feedback-content">
      <div class="rate-box">
        <ORate v-model="rateVal" color="danger" size="large" />
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
          <OButton color="primary" size="large" @click="onExternalDialog">提交issue</OButton>
        </div>
        <p class="other-text">您也可以使用<a :href="OPENEULER_FORUM" target="_blank" rel="noopener noreferrer"> 发帖求助 </a>进行反馈</p>
      </div>
    </div>
    <ODivider style="--o-divider-gap: 24px" />
    <h3 class="history-title">
      历史反馈信息
      <OPopover position="top" trigger="hover" style="width: 184px">
        <template #target>
          <OIcon ref="flagsRef" class="flags-icon"><IconHelpTips /></OIcon>
        </template>
        <div class="popover-content">历史反馈信息内容更新有延迟，请耐心等待</div>
      </OPopover>
    </h3>
    <FeedbackHistory :fieldDetailTab="props.fieldDetailTab" @goToUrl="goToFeedbackDetailUrl" :name="props.name" :version="props.version" />
  </AppSection>
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="jumpOut" />
</template>

<style lang="scss" scoped>
.popover-content {
  @include text1;
}
.history-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 500;
  color: var(--o-color-info1);

  .flags-icon {
    font-size: 16px;
    cursor: pointer;
    color: var(--o-color-info1);
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
.other-text {
  margin: 24px 0 0;
  @include text1;
  color: var(--o-color-info1);
  font-weight: 500;
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
    .o-btn + .o-btn {
      margin-left: 16px;
    }
  }
}
</style>
