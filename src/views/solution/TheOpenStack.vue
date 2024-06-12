<script setup lang="ts">
import { ref } from 'vue';
import { OCard, ODivider, OLink } from '@opensig/opendesign';
import AppBanner from '@/components/AppBanner.vue';
import ContentWrapper from '@/components/ContentWrapper.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import bannerImg from '@/assets/banner/banner1.jpg';
import OpenStack from '@/data/solution/openstack';
import { GITEE, OPENEULER } from '@/data/config';
import { checkDomainLink, windowOpen } from '@/utils/common';

const solutionInfo = {
  title: 'OpenStack',
  desc: '作为一个开源的云计算管理平台，OpenStack 由nova、cinder、neutron、glance、keystone、horizon等几个主要的组件组合起来完成具体工作',
};

const advTxt = [
  {
    name: '如流量分散特性',
    href: `${GITEE}/openeuler/openstack/blob/master/docs/spec/distributed-traffic.md`,
  },
  {
    name: '支持generic vDPA',
    href: `${GITEE}/openeuler/openstack-plugin/tree/train/`,
  },
  {
    name: 'gostone',
    href: `${GITEE}/openeuler/gostone`,
  },
];

const showExternalDlg = ref(false);
const externalLink = ref('');
const jumpTo = (href: string) => {
  externalLink.value = href;
  if (checkDomainLink(href)) {
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
        <img class="cover" :src="OpenStack.overview.cover" alt="" />
        <div class="solution-overview-box">
          <p v-for="item in OpenStack.overview.desc" :key="item" class="desc">{{ item }}</p>
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>核心功能</h2>
      </div>
      <div class="solution-core">
        <OCard
          v-for="item in OpenStack.coreList"
          :key="item.name"
          cursor="auto"
          :title="item.name"
          :detail="item.desc"
          :icon="item.icon"
          :style="{
            '--card-icon-text-align': 'center',
            '--card-title-text-align': 'center',
            '--card-detail-text-align': 'center',
          }"
        />
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>方案优势</h2>
      </div>
      <div class="solution-adv">
        <div class="adv-img-box">
          <img v-for="(item, index) in OpenStack.advImg" :src="item" :key="item" :class="`img${index}`" />
        </div>
        <ODivider style="--o-divider-gap: 40px" />
        <div class="solution-adv-box">
          <OCard
            v-for="(item, index) in OpenStack.advInfo"
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
          >
            <template #detail>
              {{ item.desc }}
              <template v-if="index === 1">
                ，<template v-for="item in advTxt" :key="item.name">
                  <OLink color="primary" @click="jumpTo(item.href)">{{ item.name }}</OLink
                  >，</template
                >等
              </template>
            </template>
          </OCard>
        </div>
      </div>
    </div>
    <div class="solution-panel">
      <div class="solution-title">
        <h2>用户案例</h2>
      </div>
      <div class="solution-info">
        <OCard
          v-for="item in OpenStack.caseList"
          :key="item.name"
          cursor="auto"
          :title="item.name"
          :href="OPENEULER + item.href"
          target="_blank"
          rel="noopener noreferrer"
          :detail="item.desc"
          :cover="item.img"
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
        margin-bottom: 16px;
      }
    }
  }
  .solution-core {
    display: flex;
    justify-content: space-between;
    background: var(--o-color-fill2);
    padding: 16px 10px;

    :deep(.o-card) {
      --card-icon-gap: 24px;
      flex: 1;
      .o-card-icon {
        svg {
          width: 48px;
          height: 48px;
        }
      }
    }
  }
  .solution-adv {
    background: var(--o-color-fill2);
    padding: 48px 48px 32px;
    .text {
      margin: 40px 0 0;
      @include tip1;
      color: var(--o-color-info1);
      text-align: center;
    }
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
      .o-card-cover-v {
        --card-cover-padding: 0;
      }
      flex: 1;
      .o-card-icon {
        svg {
          width: 48px;
          height: 48px;
        }
      }
    }
  }
}
</style>
