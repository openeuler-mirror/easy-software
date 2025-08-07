<script lang="ts" setup>
import { ref } from 'vue';
import { OLink, OIcon } from '@opensig/opendesign';
import { checkOriginLink, windowOpen } from '@/utils/common';
import { scrollToTop } from '@/utils/common';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ExternalLink from '@/components/ExternalLink.vue';

import defaultImg from '@/assets/default-logo.png';
import IconOutlink from '~icons/pkg/icon-outlink.svg';
import IconHelp from '~icons/pkg/icon-help.svg';

import coverBg from '@/assets/default-logo-cover.png';
import coverBgDark from '@/assets/default-logo-cover_dark.png';

defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const emit = defineEmits<{
  (event: 'goFeedback'): void;
}>();

const { isDark } = useTheme();
const route = useRoute();
const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  if (checkOriginLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};

const scrollToAnchor = () => {
  let top = 0;
  if (route.name === 'field-detail') {
    top = document.querySelector('.o-tab-pane-active .feedback')?.offsetTop;
  } else {
    top = document.querySelector('.feedback')?.offsetTop;
  }
  scrollToTop(top, false);
  emit('goFeedback');
};
</script>

<template>
  <div class="domain-head">
    <div class="left">
      <div class="cover" :style="{ 'background-image': `url(${isDark ? coverBgDark : coverBg})` }"><img :src="data.cover || defaultImg" alt="" /></div>
      <div class="box">
        <p class="title">
          {{ data.name }}
          <OLink v-if="data.repository" class="home-page" color="primary" @click="onExternalDialog(data.repository)" target="_blank" rel="noopener noreferrer">
            <OIcon><IconOutlink /></OIcon>
            主页
          </OLink>
        </p>
        <p v-if="data.description" class="detail">{{ data.description }}</p>
        <OLink size="small" class="scroll-box" @click="scrollToAnchor()">
          <OIcon><IconHelp /></OIcon>我要反馈
        </OLink>
      </div>
    </div>
  </div>
  <!-- 跳转外部链接提示 -->
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
@include in-dark {
  .cover {
    @include img-in-dark;
  }
}

.domain-head {
  margin-top: 24px;
  margin-bottom: 40px;
  padding: 40px;
  background: var(--o-color-fill2);
  display: flex;
  .left {
    display: flex;
    .box {
      margin-left: 32px;
      flex: 1;
      position: relative;
    }
    .title {
      @include h2;
      font-weight: 500;
      color: var(--o-color-info1);
      display: flex;
      align-items: center;
    }
    .home-page {
      --link-icon-size: 16px;
      margin-left: 16px;
      @include tip1;
    }
    :deep(.o-link) {
      .o-link-label,
      .o-link-main {
        display: flex;
        align-items: center;
        svg {
          width: 16px;
          margin-right: 4px;
        }
      }
    }
    .scroll-box {
      position: absolute;
      bottom: 0px;
      :deep(.o-link-main) {
        display: flex;
        align-items: center;
      }
      svg {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
  }

  .cover {
    width: 300px;
    height: 174px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: no-repeat center;
    padding: 12px;
    img {
      max-width: 100%;
      max-height: 86px;
    }
  }

  .detail {
    @include text1;
    color: var(--o-color-info2);
    margin-top: 16px;

    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    position: relative;
    word-break: break-all;
  }
}
</style>
