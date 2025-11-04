<script setup lang="ts">
import { ref } from 'vue';
import { OCard } from '@opensig/opendesign';
import AppBanner from '@/components/AppBanner.vue';
import ContentWrapper from '@/components/ContentWrapper.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import bannerImg from '@/assets/banner/banner1.jpg';
import OPEA from '@/data/solution/opea';

import { checkOriginLink, windowOpen } from '@/utils/common';

import Img1 from '@/assets/solution/opea/img1.png';

const solutionInfo = {
  title: 'OPEA',
  desc: 'OPEA是一个开源的生成式AI解决方案，提供了一系列涵盖基础模型服务、数据处理与增强、应用专用服务等各方面的微服务模块。',
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const jumpTo = (href: string) => {
  externalLink.value = href;
  if (checkOriginLink(href)) {
    windowOpen(href, '_blank');
  } else {
    showExternalDlg.value = true;
  }
};
</script>
<template>
  <AppBanner :title="solutionInfo.title" :background-image="bannerImg" :subtitle="solutionInfo.desc" />
  <ContentWrapper>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>方案概述</h2>
      </div>
      <div class="solution-overview">
        <img class="cover" :src="OPEA.overview.cover" alt="" />
        <div class="solution-overview-box">
          <p class="desc">{{ OPEA.overview.desc }}</p>
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>核心功能</h2>
      </div>
      <div class="solution-core">
        <img class="cover" :src="Img1" alt="" />
        <div class="solution-core-box">
          <OCard
            v-for="item in OPEA.coreList"
            :key="item.name"
            cursor="auto"
            :title="item.name"
            :detail="item.desc"
            :icon="item.icon"
            layout="h"
            :style="{
              '--card-icon-text-align': 'center',
              '--card-title-text-align': 'left',
              '--card-detail-text-align': 'left',
              '--card-icon-size': '48px',
            }"
          />
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>方案优势</h2>
      </div>
      <div class="solution-adv">
        <div class="solution-adv-box">
          <OCard
            v-for="item in OPEA.advInfo"
            :key="item.name"
            cursor="auto"
            :title="item.name"
            :detail="item.desc"
            layout="h"
            :style="{
              '--card-icon-text-align': 'center',
              '--card-title-text-align': 'left',
              '--card-detail-text-align': 'left',
            }"
          />
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>相关资讯</h2>
      </div>
      <div class="solution-info">
        <OCard
          v-for="item in OPEA.infoList"
          :key="item.name"
          cursor="auto"
          :title="item.name"
          @click="jumpTo(item.href)"
          :icon="item.icon"
          target="_blank"
          rel="noopener noreferrer"
          layout="h"
          :style="{
            '--card-icon-text-align': 'center',
            '--card-title-text-align': 'left',
            '--card-detail-text-align': 'left',
            '--card-icon-size': '32px',
          }"
        />
      </div>
    </div>
    <!-- 跳转外部链接提示 -->
    <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.solution-panel {
  padding: 72px 0 0;
  &:last-child {
    padding-bottom: 72px;
  }
  .solution-title {
    margin-bottom: 40px;
    text-align: center;
    h2 {
      @include display3;
      color: var(--o-color-info1);
      font-weight: 500;
    }
  }
  .solution-overview {
    display: flex;
    justify-content: space-between;
    height: 210px;
    background: var(--o-color-fill2);
    .cover {
      width: 375px;
      height: 100%;
      order: 2;
    }
    .solution-overview-box {
      flex: 1;
      padding: 40px;
      .desc {
        @include text1;
        color: var(--o-color-info1);
      }
    }
  }
  .solution-core {
    display: flex;
    justify-content: space-between;
    background: var(--o-color-fill2);
    padding: 40px 32px;
    .cover {
      width: 505px;
      height: 436px;
    }
    .solution-core-box {
      flex: 1;
      padding-left: 10px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      :deep(.o-card) {
        --card-icon-gap: 24px;
        width: 100%;
        .o-card-icon {
          svg {
            width: 48px;
            height: 48px;
            fill: currentColor;
          }
        }
      }
    }
  }
  .solution-adv {
    background: var(--o-color-fill2);
    padding: 48px;

    .solution-adv-box {
      display: flex;
      .o-card + .o-card {
        margin-left: 80px;
      }
      :deep(.o-card) {
        --card-main-padding: 0;
        flex: 1;
      }
    }
  }
  .solution-info {
    display: flex;
    justify-content: space-between;

    .o-card + .o-card {
      margin-left: 32px;
    }
    :deep(.o-card) {
      --card-main-padding: 32px 40px;
      --card-content-gap: 0;
      flex: 1;
      .o-card-title {
        cursor: pointer;
      }
      &:hover {
        .o-card-title {
          color: var(--o-color-primary1);
        }
        svg {
          color: var(--o-color-primary1);
        }
      }
      .o-card-icon {
        svg {
          width: var(--card-icon-size);
          height: var(--card-icon-size);
          fill: currentColor;
        }
      }
    }
  }
}
</style>
