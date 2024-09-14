<script setup lang="ts">
import { ref, computed } from 'vue';
import { OButton, ODivider, OIcon, OLink, OOption, OPopup, ORate, OScroller, OSelect, OTextarea, useMessage } from '@opensig/opendesign';
import IconOutlink from '~icons/app/icon-outlink.svg';
import type { FeedbackHistoryT } from '@/@types/feedback';
import { getGlobalFeedbackHistoryList, postGlobalFeedback } from '@/api/api-feedback';
import { dayjs } from 'element-plus';

import iconButton from '~icons/app/icon-feedback.svg';
import Result404 from './Result404.vue';
import { useLoginStore } from '@/stores/user';
import { windowOpen } from '@/utils/common';

const loginStore = useLoginStore()
const message = useMessage();
const globalFeedbackBtnRef = ref();

const isShowingFeedbackList = ref(false);
const feedbackTitle = computed(() => isShowingFeedbackList.value ? '历史反馈信息' : '反馈');
const bottomLinkContent = computed(() => (isShowingFeedbackList.value ? '提交反馈' : '查看历史反馈信息'));

const rateVal = ref(0);
const feedbackContent = ref('');

// 状态筛选
const feedbackState = ref('');
const feedbackOptions = [
  { label: '全部', value: '' },
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

const feedbacks = ref<FeedbackHistoryT[]>([]);

const getFeedbackList = () => {
  getGlobalFeedbackHistoryList(1, 500, feedbackState.value)
    .then((res) => {
      if (res[0]?.data?.length) {
        res[0].data.forEach((item) => (item.create_at = dayjs(item.create_at).format('YYYY/MM/DD HH:mm:ss')));
        feedbacks.value = res[0].data;
        return;
      }
      feedbacks.value = [];
    })
    .catch(() => (feedbacks.value = []));
};

const onClickSwitch = () => {
  isShowingFeedbackList.value = !isShowingFeedbackList.value;
  if (isShowingFeedbackList.value) {
    getFeedbackList();
  }
};

const postFeedback = () => {
  if (!loginStore.isLogined) {
    windowOpen(import.meta.env.VITE_LOGIN_URL);
    return;
  }
  postGlobalFeedback(window.location.href, rateVal.value, feedbackContent.value)
    .then(() => {
      feedbackContent.value = '';
      rateVal.value = 0;
    })
    .catch(() => message.danger({ content: '反馈失败' }));
};
</script>

<template>
  <Teleport to="body">
    <div ref="globalFeedbackBtnRef" class="global-feedback-btn">
      <iconButton />
    </div>
    <OPopup :target="globalFeedbackBtnRef" trigger="click" position="right">
      <div class="global-feedback">
        <span>{{ feedbackTitle }}</span>
        <template v-if="!isShowingFeedbackList">
          <ORate v-model="rateVal" color="danger" style="margin-top: 18px" />
          <OTextarea v-model="feedbackContent" placeholder="请输入您的反馈" resize="none" clearable style="margin-top: 20px; width: 300px; height: 88px" />
          <OButton class="button" color="primary" variant="solid" round="pill" @click="postFeedback">提交反馈</OButton>
        </template>
        <div class="feedback-list" v-else>
          <template v-if="feedbacks.length">
            <div class="title">
              <span>共{{ feedbacks.length }}条反馈信息</span>
              <OSelect v-model="feedbackState" @change="getFeedbackList" style="max-width: 108px">
                <OOption v-for="item in feedbackOptions" :key="item.value" :value="item.label">
                  {{ item.label }}
                </OOption>
              </OSelect>
            </div>
            <ODivider direction="h" style="width: 300px"></ODivider>
            <OScroller class="scroller" :style="{ scrollerMaxHeight, minHeight: '168px' }">
              <div class="feedback-item" v-mounted>
                <div class="content">
                  <p class="feedback-title">t</p>
                </div>
                <p class="time">t</p>
              </div>
              <div class="feedback-item" v-for="(item, index) in feedbacks" :key="index">
                <div class="content">
                  <p class="feedback-title">
                    {{ item.feedback }}
                  </p>
                  <OLink class="out-link" href="www.baidu.com" color="primary" hover-underline target="_blank" rel="noopener noreferrer">
                    查看详情
                    <OIcon><IconOutlink /></OIcon>
                  </OLink>
                </div>
                <p class="time">{{ item.create_at }}</p>
              </div>
            </OScroller>
          </template>
          <Result404 v-else>
            <template #description>
              <p class="empty-desc">暂无反馈消息</p>
            </template>
          </Result404>
        </div>
        <ODivider direction="h" class="divider"></ODivider>
        <div class="title">
          <OLink @click="onClickSwitch">{{ bottomLinkContent }}</OLink>
        </div>
      </div>
    </OPopup>
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
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--o-color-primary1);
  box-shadow: var(--o-shadow-1);

  cursor: pointer;
  position: fixed;
  right: 48px;
  bottom: 365px;
  width: 48px;
  height: 48px;
  background-color: var(--o-color-fill2);
}

.global-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 360px;
  background-color: var(--o-color-fill2);
  padding: 16px 0;

  .title {
    display: flex;
    justify-content: center;
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

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 300px;
      @include tip2;
    }

    .scroller {
      padding: 0 30px;
      width: 100%;
    }

    .feedback-item {
      margin-top: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--o-color-control1-light);

      .out-link {
        flex-shrink: 0;
        @include tip1;

        :deep(.o-link-label) {
          display: flex;
          align-items: center;
          gap: 8px;

          svg {
            width: 16px;
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
        }
      }

      .time {
        @include tip2;
        margin-top: 8px;
        color: var(--o-color-control1);
      }
    }
  }
}
</style>
