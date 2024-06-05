<script lang="ts" setup>
import { ref } from 'vue';
import { OLink, OIcon } from '@opensig/opendesign';
import { checkDomainLink, windowOpen } from '@/utils/common';

import Email from '@/assets/email.svg';
import Gitee from '@/assets/gitee.svg';
import IconOutlink from '~icons/pkg/icon-outlink.svg';
import { GITEE } from '@/data/config';
import IconHelp from '~icons/pkg/icon-help.svg';
import ExternalLink from '@/components/ExternalLink.vue';

defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  maintainer: {
    type: Object,
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

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  if (checkDomainLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};

const scrollToAnchor = (id: any) => {
  setTimeout(() => {
    const doc = document.getElementById(id);
    doc?.scrollIntoView();
  }, 100);
};
</script>

<template>
  <div class="domain-head-box">
    <AppSection>
      <div class="domain-info">
        <div class="left">
          <div class="cover"><img :src="data.cover" alt="" /></div>
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
            <OLink color="primary" size="small" class="scroll-box" @click="scrollToAnchor('feed')">
              <OIcon><IconHelp /></OIcon>我要反馈
            </OLink>
          </div>
        </div>

        <div class="right">
          <p class="sp">维护者信息</p>
          <p v-if="maintainer.maintainerId" class="title">维护者：{{ maintainer.maintainerId }}</p>
          <p v-if="maintainer.maintainerEmail" class="text">
            <a class="email" :href="`mailto:${maintainer.maintainerEmail}`">
              <img :src="Email" class="icon-img" alt="" />
              <span>{{ `mailto:${maintainer.maintainerEmail}` }}</span>
            </a>
          </p>
          <p v-if="maintainer.maintainerGiteeId" class="text">
            <a class="gitee" @click="onExternalDialog(`${GITEE}/${maintainer.maintainerGiteeId}`)">
              <img :src="Gitee" class="icon-img" alt="" />
              <span>{{ `${GITEE}/${maintainer.maintainerGiteeId}` }}</span>
            </a>
          </p>
        </div>
      </div>
    </AppSection>
    <!-- 跳转外部链接提示 -->
    <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
  </div>
</template>

<style lang="scss" scoped>
.domain-head-box {
  margin-top: 24px;
  margin-bottom: 40px;
  .domain-info {
    display: flex;
    .left {
      display: flex;
      width: 70%;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
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
        a {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .title {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.8);
        line-height: 24px;
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
      background: url(@/assets/default-logo-cover.png) no-repeat center;
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
}
</style>
