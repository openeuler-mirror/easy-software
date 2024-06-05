<script setup lang="ts">
import { OCard, ODivider } from '@opensig/opendesign';
import AppBanner from '@/components/AppBanner.vue';
import ContentWrapper from '@/components/ContentWrapper.vue';
import bannerImg from '@/assets/banner/banner1.jpg';
import OpenHPC from '@/data/solution/openhpc';
import { GITHUB } from '@/data/config';

const solutionInfo = {
  title: 'OpenHPC',
  desc: 'OpenHPC是一个开源的高性能计算解决方案，它提供了构建、部署和管理高性能计算(HPC)集群所需要的工具，包括系统工具、资源管理器、I/O客户端、开发工具和各种科学库',
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
        <img class="cover" :src="OpenHPC.overview.cover" alt="" />
        <div class="solution-overview-box">
          <p class="desc">{{ OpenHPC.overview.desc }}</p>
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>核心功能</h2>
      </div>
      <div class="solution-core">
        <img class="cover" :src="OpenHPC.coreImg" alt="" />
        <div class="solution-core-box">
          <OCard
            v-for="item in OpenHPC.coreList"
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
        <div class="adv-img-box">
          <img v-for="(item, index) in OpenHPC.advImg" :src="item" :key="item" :class="`img${index}`" />
        </div>
        <ODivider style="--o-divider-gap: 40px" />
        <div class="solution-adv-box">
          <OCard
            v-for="item in OpenHPC.advInfo"
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
          v-for="item in OpenHPC.infoList"
          :key="item.name"
          cursor="auto"
          :title="item.name"
          :detail="item.desc"
          :href="GITHUB + item.href"
          :icon="item.icon"
          target="_blank"
          rel="noopener noreferrer"
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
    height: 280px;
    background: var(--o-color-fill2);
    .cover {
      width: 498px;
      height: 100%;
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
    padding: 40px 72px;
    .cover {
      width: 404px;
      height: 402px;
    }
    .solution-core-box {
      flex: 1;
      padding: 40px 0 0 135px;
      :deep(.o-card) {
        --card-icon-gap: 24px;
        .o-card-icon {
          svg {
            width: 48px;
            height: 48px;
          }
        }
      }
    }
  }
  .solution-adv {
    background: var(--o-color-fill2);
    padding: 48px;
    .adv-img-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 48px;
      .img0,
      .img2 {
        height: 40px;
      }
      .img1 {
        height: 32px;
      }
    }
    .solution-adv-box {
      display: flex;
      gap: 80px;
      :deep(.o-card) {
        --card-main-padding: 0;
        flex: 1;
      }
    }
  }
  .solution-info {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    :deep(.o-card) {
      --card-main-padding: 40px;
      flex: 1;
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
          width: 48px;
          height: 48px;
          fill: currentColor;
        }
      }
    }
  }
}
</style>
