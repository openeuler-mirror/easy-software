<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch, type CSSProperties } from 'vue';
import {
  OButton,
  ODivider,
  OIcon,
  OLink,
  OOption,
  OPopover,
  OPopup,
  OScroller,
  OSelect,
  OTag,
  OTextarea,
  useMessage,
} from '@opensig/opendesign';
import IconOutlink from '~icons/app/icon-outlink.svg';
import type { FeedbackHistoryT } from '@/@types/feedback';
import { getGlobalFeedbackHistoryList, postGlobalFeedback } from '@/api/api-feedback';
import { dayjs } from 'element-plus';

import IconClose from '~icons/app/icon-close.svg';
import Error404Result from '@/components/Error404Result.vue';
import { useLoginStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { doLogin } from '@/shared/login';
import IconLoading from '~icons/app/icon-loading.svg';
import IconHelp from '~icons/app/icon-question.svg';
import IconSmile from '~icons/app/icon-smile.svg';
import { useRoute } from 'vue-router';
import { createReusableTemplate, onClickOutside, useDebounceFn } from '@vueuse/core';
import { oaReport } from '@/shared/analytics';
import ScoreSlider from './ScoreSlider.vue';

const FEEDBACK_REGEXP = /(.*?)4. 【用户名】.*$/;
const REPLACE_REGEXP = /\r|\n/g;
const STORAGE_KEY = 'global-feedback';
const { t } = useI18n();
const loginStore = useLoginStore();
const message = useMessage();
const popupTargetRef = ref();
const popupBodyRef = ref();
const feedbackListRef = ref();
const route = useRoute();

const isDetailPage = computed(() => {
  if (!route.name) {
    return true;
  }
  return (route.name as string).endsWith('-detail') && route.name !== 'todo-detail';
});

const isShowingFeedbackList = ref(false);
const bottomLinkContent = computed(() => (isShowingFeedbackList.value ? '提交反馈' : '查看历史反馈信息'));
const rateVal = ref(0);
const feedbackContent = ref('');
const popupVisible = ref(false);

const feedbackBtnColor = computed<CSSProperties>(() => {
  if (popupVisible.value) {
    return { color: 'var(--o-color-primary1)' };
  }
  return {};
})

const placeholder = computed(() => {
  if (rateVal.value < 7) {
    return '请输入您不太满意的原因';
  } else if (rateVal.value < 9) {
    return '改进哪些方面会让您更满意？';
  } else {
    return '请输入您满意的原因';
  }
});

const reportAnalytics = (data: Record<string, any>, event = 'click') => {
  oaReport(event, {
    module: 'global_feedback',
    tab: route.name,
    ...data,
  });
};

const onRateChange = (val: number) => {
  reportAnalytics({
    type: 'rate',
    target: val,
  });
};

const onInput = useDebounceFn(() => {
  reportAnalytics(
    {
      content: feedbackContent.value,
    },
    'input'
  );
}, 500);

onClickOutside(popupBodyRef, (event) => {
  event.stopPropagation();
  if (popupVisible.value) {
    popupVisible.value = false;
  }
});

watch(popupVisible, (val) => {
  if (!val) {
    isShowingFeedbackList.value = false;
    rateVal.value = 0;
    feedbackContent.value = '';
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
  if (val) {
    reportAnalytics({
      type: 'open',
    });
  }
});

const onClickCloseIcon = () => (popupVisible.value = false);

onMounted(() => {
  const storage = window.sessionStorage.getItem(STORAGE_KEY);
  if (storage) {
    const { content, rate } = JSON.parse(storage);
    rateVal.value = rate;
    feedbackContent.value = content;
  }
});

// 状态筛选
const feedbackState = ref('');
const feedbackOptions = [
  { label: '全部状态', value: '' },
  { label: '待办的', value: '待办的' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已拒绝', value: '已拒绝' },
];

const scrollerMaxHeight = ref('');
const vMounted = {
  mounted(el: HTMLDivElement) {
    const { height } = el.getBoundingClientRect();
    el.style.display = 'none';
    scrollerMaxHeight.value = `${Math.floor(height * 7.5)}px`;
  },
};

let canvasCtx: CanvasRenderingContext2D;
// 计算文本长度，决定是否显示省略号
const vCalcTextLength = (el: HTMLElement) => {
  const text = el.childNodes[0]?.textContent as string;
  if (!canvasCtx) {
    canvasCtx = document.createElement('canvas').getContext('2d')!;
    canvasCtx.font = window.getComputedStyle(el).getPropertyValue('font');
  }
  const textLen = canvasCtx.measureText(text).width;
  const containerWidth = el.getBoundingClientRect().width;
  const tagWidth = el.querySelector('.o-tag')?.getBoundingClientRect().width as number;
  if (textLen >= containerWidth * 4 - tagWidth) {
    (el.querySelector('.dots-tag') as HTMLSpanElement).style.position = 'absolute';
    (el.querySelector('.dots') as HTMLSpanElement).style.display = 'inline-block';
  }
};

const feedbacks = ref<FeedbackHistoryT[]>([]);

const empty = ref(true);

const tagColor = (tag: string) => {
  switch (tag) {
    case '待办的':
      return 'warning';
    case '进行中':
      return 'primary';
    case '已完成':
      return 'success';
    case '已拒绝':
      return 'danger';
    default:
      return 'normal';
  }
};

const loading = ref(false);

const getFeedbackList = async () => {
  try {
    loading.value = true;
    const res = await getGlobalFeedbackHistoryList(1, 100, feedbackState.value);
    if (res[0]?.data?.length) {
      res[0].data.forEach((item) => {
        item.feedback = (item.feedback.replace(REPLACE_REGEXP, '').match(FEEDBACK_REGEXP)?.[1] as string).trim();
        item.created_at = dayjs(item.created_at).format('YYYY/MM/DD HH:mm:ss');
      });
      feedbacks.value = res[0].data;
      return;
    }
    feedbacks.value = [];
  } catch (error) {
    feedbacks.value = [];
  } finally {
    loading.value = false;
  }
};

const onClickSwitch = async () => {
  isShowingFeedbackList.value = !isShowingFeedbackList.value;
  if (isShowingFeedbackList.value) {
    empty.value = true;
    feedbackState.value = '';
    if (loginStore.isLogined) {
      await getFeedbackList();
    } else {
      feedbacks.value = [];
    }
    empty.value = !feedbacks.value.length;
  } else {
    empty.value = true;
  }
};

const goToLogin = () => {
  if (rateVal.value && feedbackContent.value.trim()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: rateVal.value, content: feedbackContent.value }));
  }
  doLogin();
}

const postFeedback = () => {
  if (!rateVal.value) {
    return message.warning({
      content: t('software.feedbackMessage[1]'),
    });
  }
  if (!feedbackContent.value.trim()) {
    return message.warning({
      content: t('software.feedbackMessage[0]'),
    });
  }
  reportAnalytics({
    type: 'submit',
    content: feedbackContent.value,
    rate: rateVal.value,
  });

  postGlobalFeedback(window.location.href, rateVal.value, feedbackContent.value)
    .then(() => {
      window.sessionStorage.removeItem(STORAGE_KEY);
      feedbackContent.value = '';
      rateVal.value = 0;
      message.success({ content: '反馈成功' });
    })
    .catch(() => message.danger({ content: '反馈失败' }));
};

const onClick = () => {
  popupVisible.value = !popupVisible.value;
};

onUnmounted(() => window.sessionStorage.removeItem(STORAGE_KEY));

const [DefinePopupHint, ReuseablePopupHint] = createReusableTemplate();
</script>

<template>
  <DefinePopupHint>
    <OPopover :wrapper="popupBodyRef">
      <template #target>
        <OIcon class="help-icon"><IconHelp /></OIcon>
      </template>
      <p style="max-width: 170px; word-break: break-all">历史反馈信息内容更新有延迟，请耐心等待</p>
    </OPopover>
  </DefinePopupHint>

  <Teleport to="body">
    <div
      class="global-feedback-btn"
      v-if="!isDetailPage"
      @click="onClick"
      :style="feedbackBtnColor"
    >
      <IconSmile />
      <div class="popup-target" ref="popupTargetRef"></div>
      <OPopup :target="popupTargetRef" v-model:visible="popupVisible" body-class="global-feedback-popup" trigger="none" position="lb">
        <div ref="popupBodyRef" class="global-feedback">
          <OIcon class="close-icon">
            <IconClose @click="onClickCloseIcon" />
          </OIcon>
          <div class="title">
            <span v-if="!isShowingFeedbackList">
              您对
              <span class="title-name">软件中心</span>
              的整体满意度如何？
            </span>
            <template v-else>历史反馈信息<ReuseablePopupHint /></template>
          </div>
          <template v-if="!isShowingFeedbackList">
            <ScoreSlider v-model="rateVal" :show-desc="true" @change="onRateChange" />
            <OTextarea
              @input="onInput"
              v-model="feedbackContent"
              :placeholder="placeholder"
              :max-length="500"
              resize="none"
              clearable
              style="margin-top: 16px; width: 300px; height: 88px"
              :inputOnOutlimit="false"
            />
            <OButton class="button" color="primary" variant="solid" round="pill" @click="postFeedback">提交</OButton>
          </template>
          <div ref="feedbackListRef" class="feedback-list" v-else>
            <div class="mask" v-if="loading">
              <OIcon><IconLoading class="o-rotating" /></OIcon>
            </div>
            <template v-if="loginStore.isLogined && !empty">
              <div class="title">
                <span>共{{ feedbacks.length }}条反馈信息</span>
                <OSelect v-model="feedbackState" @change="getFeedbackList" :options-wrapper="feedbackListRef" style="max-width: 108px; max-height: 80px">
                  <OOption v-for="item in feedbackOptions" :key="item.value" :value="item.value" :label="item.label">
                    {{ item.label }}
                  </OOption>
                </OSelect>
              </div>
              <ODivider direction="h" style="width: 300px"></ODivider>
              <OScroller v-if="feedbacks.length" class="scroller" :style="{ maxHeight: scrollerMaxHeight, minHeight: '168px' }">
                <div class="feedback-item" v-mounted>
                  <div class="content">
                    <p class="feedback-title">t</p>
                    <OLink class="out-link" target="_blank" rel="noopener noreferrer">
                      查看详情
                      <OIcon><IconOutlink /></OIcon>
                    </OLink>
                  </div>
                  <p class="time">t</p>
                </div>
                <div class="feedback-item" v-for="(item, index) in feedbacks" :key="index">
                  <div class="content">
                    <p v-calc-text-length class="feedback-title">
                      {{ item.feedback }}
                      <span class="dots-tag">
                        <span class="dots"> ... </span>
                        <OTag class="tag" :color="tagColor(item.issue_customize_state)" size="small">{{ item.issue_customize_state }}</OTag>
                      </span>
                    </p>
                    <OLink class="out-link" :href="item.url" color="primary" target="_blank" rel="noopener noreferrer">
                      查看详情
                      <OIcon><IconOutlink /></OIcon>
                    </OLink>
                  </div>
                  <p class="time">{{ item.created_at }}</p>
                </div>
              </OScroller>
              <div v-else class="empty">暂无反馈信息</div>
            </template>
            <Error404Result v-else>
              <template #description>
                <p class="empty-desc">
                  <template v-if="!loginStore.isLogined"> <OLink color="primary" @click="doLogin">登录</OLink>可查看历史反馈信息 </template>
                  <template v-else> 暂无反馈消息 </template>
                </p>
              </template>
            </Error404Result>
          </div>
          <div class="bottom-link">
            <OLink v-if="loginStore.isLogined" @click="onClickSwitch">{{ bottomLinkContent }}</OLink>
            <template v-else>
              <OLink @click="goToLogin" style="margin-right: 4px;" color="primary">
                登录
              </OLink>
              查看历史反馈信息
              <ReuseablePopupHint />
            </template>
          </div>
        </div>
      </OPopup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
:deep(.o-result) {
  --result-image-width: 142px;
  --result-image-height: 142px;
}

.empty-desc {
  @include tip2;
}

.global-feedback-btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--o-shadow-3);
  z-index: 1000;
  border-radius: 4px;

  cursor: pointer;
  position: fixed;
  right: 48px;
  bottom: 365px;
  width: 48px;
  height: 48px;
  background-color: var(--o-color-fill2);

  .popup-target {
    position: absolute;
    top: 304px;
    width: 100%;
    height: 1px;
    background-color: transparent;
  }

  color: var(--o-color-control3);
  @include hover {
    color: var(--o-color-primary1);
  }
}

.global-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 360px;
  background-color: var(--o-color-fill2);
  padding: 16px 0;
  padding-bottom: 0;
  color: var(--o-color-info2);
  border: none;
  border-radius: 4px;

  .help-icon {
    margin-left: 10px;
    font-size: 20px;
    cursor: pointer;
    color: var(--o-color-control3);

    @include hover {
      color: var(--o-color-primary1);
    }

    svg {
      width: 1em;
      height: 1em;
    }
  }

  .title {
    font-weight: 500;
    display: flex;
    align-items: center;
    @include tip1;

    .title-name {
      font-weight: 600;
    }
  }

  .close-icon {
    position: absolute;
    top: 8px;
    right: 12px;
    cursor: pointer;
    transition: all var(--o-duration-m1) var(--o-easing-standard-in);
    font-size: 20px;

    svg {
      width: 1em;
      height: 1em;
    }

    @include hover {
      transform: rotate(180deg);
      color: var(--o-color-primary1);
    }
  }

  .bottom-link {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    border-top: 1px solid var(--o-color-control4);
    height: 46px;
    width: 100%;
    @include tip1;
  }

  .rating-wrap {
    display: flex;
    justify-content: center;
    margin-top: 18px;
  }

  .button {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .divider {
    width: 100%;
  }

  .feedback-list {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16px;
    width: 100%;

    :deep(.o-popup) {
      height: 100px;
    }

    .mask {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--o-color-fill2);
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      height: 176px;
    }

    .empty {
      height: 146px;
      display: flex;
      justify-content: center;
      align-items: center;
      @include tip2;
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 300px;
      @include tip2;
    }

    .scroller {
      width: 100%;
      padding: 0 30px;
    }

    .feedback-item {
      margin-top: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--o-color-control4);

      .out-link {
        flex-shrink: 0;
        @include tip1;

        :deep(.o-link-main) {
          display: flex;
          align-items: center;
          gap: 8px;

          svg {
            width: 1em;
            height: 1em;
            margin-right: 4px;
          }
        }
      }

      .content {
        display: flex;
        justify-content: space-between;
        align-items: start;

        .feedback-title {
          @include tip1;
          max-width: 200px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          position: relative;
          word-break: break-all;

          .dots-tag {
            background-color: var(--o-color-fill2);
            bottom: 0;
            right: 0;
          }

          .dots {
            display: none;
            margin-right: 8px;
          }
        }
      }

      .time {
        @include tip2;
        margin-top: 8px;
        color: var(--o-color-control2);
      }
    }
  }
}
</style>
