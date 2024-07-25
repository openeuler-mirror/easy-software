<script setup lang="ts">
import type { FeedbackHistoryT } from '@/@types/feedback';
import { ODivider, OIcon, OLink, OTag } from '@opensig/opendesign';
import { computed } from 'vue';
import IconUser from '~icons/app/icon-user.svg';
import IconOutlink from '~icons/app/icon-outlink.svg';

const props = defineProps<{
  feedback: FeedbackHistoryT;
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
      <OTag :color="tagColor(feedback.issue_customize_state)" size="small">{{ feedback.issue_customize_state }}</OTag>
    </p>
    <p class="feedback-desc">
      {{ desc }}
      <ODivider direction="v" style="margin: 0" :darker="true"></ODivider>
      <OIcon><IconUser /></OIcon>
      {{ feedback.user_login }}
    </p>
    <OLink :href="feedback.url" class="out-link" color="primary" hover-underline target="_blank" rel="noopener noreferrer">
      查看详情
      <OIcon class="icon"><IconOutlink /></OIcon>
    </OLink>
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

  .out-link {
    position: absolute;
    right: 16px;
    bottom: 16px;

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

  .feedback-content {
    @include text1;
    word-break: break-all;
    max-width: 660px;
  }

  .feedback-desc {
    display: flex;
    gap: 8px;
    color: var(--o-color-info3);
    @include tip2;
  }
}
</style>
