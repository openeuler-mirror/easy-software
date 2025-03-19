<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { OLink, OIcon } from '@opensig/opendesign';
import { checkOriginLink, windowOpen } from '@/utils/common';
import { scrollToTop } from '@/utils/common';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ExternalLink from '@/components/ExternalLink.vue';

import type { MaintainerT } from '@/@types/app';
import { GITEE } from '@/data/config';

import IconEmail from '~icons/pkg/email.svg';
import IconGitee from '~icons/pkg/gitee.svg';
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
  maintainer: {
    type: Object as PropType<MaintainerT>,
    default: () => {
      return {};
    },
  },
  basicInfo: {
    default: () => {
      return '';
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
      <div class="cover" :style="{ 'background-image': `url(${isDark ? coverBgDark : coverBg})` }"><img :src="data.cover" alt="" /></div>
      <div class="box">
        <p class="title">
          {{ data.name }}
          <OLink
            v-if="data.repository"
            class="home-page"
            color="primary"
            hover-underline
            @click="onExternalDialog(data.repository)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <OIcon><IconOutlink /></OIcon>
            主页
          </OLink>
        </p>
        <p v-if="basicInfo" class="detail">{{ basicInfo }}</p>
        <OLink size="small" class="scroll-box" @click="scrollToAnchor('feed')">
          <OIcon><IconHelp /></OIcon>我要反馈
        </OLink>
      </div>
    </div>

    <div class="right">
      <p class="sp">维护者信息</p>
      <p v-if="maintainer.maintainerId" class="title">维护者：{{ maintainer.maintainerId }}</p>
      <p v-if="maintainer.maintainerEmail" class="text">
        <a class="email" :href="`mailto:${maintainer.maintainerEmail}`">
          <OIcon class="icon-img"><IconEmail /></OIcon>
          <span>{{ maintainer.maintainerEmail }}</span>
        </a>
      </p>
      <p v-if="maintainer.maintainerGiteeId" class="text">
        <a class="gitee" @click="onExternalDialog(`${GITEE}/${maintainer.maintainerGiteeId}`)">
          <OIcon class="icon-img"><IconGitee /></OIcon>
          <span>{{ `${GITEE}/${maintainer.maintainerGiteeId}` }}</span>
        </a>
      </p>
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
    width: 70%;
    border-right: 1px solid var(--o-color-control4);
    padding-right: 64px;
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
      justify-content: space-between;
    }
    .home-page {
      --link-icon-size: 16px;
      @include tip1;
      :deep(.o-link-label) {
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
      :deep(.o-link-label) {
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
  .right {
    margin-left: 40px;
    flex: 1;
    img {
      width: 24px;
    }
    .text {
      margin-top: 8px;
      @include text1;

      a {
        display: flex;
        align-items: center;
        .icon-img {
          margin-right: 8px;
          color: var(--o-color-info1);
        }
      }
    }

    .title {
      @include text1;
      color: var(--o-color-info2);
      margin: 24px 0px 16px 0px;
    }
    .sp {
      font-size: 22px;
      line-height: 30px;
      font-weight: 500;
      color: var(--o-color-info1);
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
