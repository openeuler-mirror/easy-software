<script setup lang="ts">
import type { FeedbackHistoryT } from '@/@types/feedback';
import { ODivider, OIcon, OLink, OTag } from '@opensig/opendesign';
import { computed } from 'vue';
import IconUser from '~icons/app/icon-user.svg';
import IconOutlink from '~icons/app/icon-outlink.svg';

const props = defineProps<{
  feedback: FeedbackHistoryT;
}>();

defineEmits<{
  (event: 'goToUrl', url: string): void;
}>();

const desc = computed(() => {
  const title = props.feedback.issue_title;
  return title.substring(title.indexOf('】') + 1);
});

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
</script>
<template>
  <div class="feedback-history-item">
    <p class="feedback-content">
      {{ feedback.feedback }}
      <OTag class="tag" :color="tagColor(feedback.issue_customize_state)" size="small">{{ feedback.issue_customize_state }}</OTag>
    </p>
    <div class="feedback-desc">
      <div class="feedback-desc-left">
        <p>{{ desc }}</p>
        <ODivider class="divider" direction="v" :darker="true"></ODivider>
        <OIcon class="icon-user"><IconUser /></OIcon>
        <span>{{ feedback.user_login }}</span>
      </div>
      <OLink @click="$emit('goToUrl', feedback.url)" class="out-link" color="primary" hover-underline target="_blank" rel="noopener noreferrer">
        查看详情
        <OIcon class="icon"><IconOutlink /></OIcon>
      </OLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.feedback-history-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 16px 16px;
  border-bottom: 1px solid rgb(var(--o-black), 0.1);

  .feedback-content {
    @include text1;
    word-break: break-all;
    max-width: 660px;
    color: var(--o-color-info1);

    .tag {
      border: none;
      --layout-pkg-radius: 2px;
      --tag-padding: 0 8px;
      margin-left: 6px;
      transform: translateY(-1px);
    }
  }

  .feedback-desc {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--o-color-info3);

    .out-link {
      flex-shrink: 0;

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

    .feedback-desc-left {
      margin-right: 24px;
      width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      @include tip2;

      & > :not(:first-child) {
        margin-left: 8px;
      }

      .divider {
        margin-right: 0;
      }

      .icon-user {
        width: 16px;
      }

      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
