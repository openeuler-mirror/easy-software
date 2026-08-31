<script lang="ts" setup>
import { OIcon } from '@opensig/opendesign';
import { homeData } from '@/data/home/index';
import { useLocale } from '@/composables/useLocale';

const { locale } = useLocale();

// Hover 修改资源icon 颜色
const resourceHover = (id: string) => {
  const paths = document.querySelectorAll(`.resource-item #${id}-icon`);
  paths.forEach((path) => {
    path.setAttribute('fill', 'var(--o-color-primary1)');
  });
};
const resourceLeave = (id: string) => {
  const paths = document.querySelectorAll(`.resource-item #${id}-icon`);
  paths.forEach((path) => {
    path.setAttribute('fill', '');
  });
};

const onClickLink = (name: string) => {
  (window as any).__OA_REPORT__?.('click', {
    module: 'home_page',
    type: 'resource',
    level1: '获取资源',
    level2: name,
    target: name,
  });
};
</script>

<template>
  <div class="resource-content">
    <div v-for="item in homeData" :key="item.name" class="resource-panel">
      <RouterLink
        :to="`/${locale}${item.href}`"
        @click="onClickLink(item.name)"
        class="resource-item"
        @mouseenter="resourceHover(item.id)"
        @mouseleave="resourceLeave(item.id)"
      >
        <div class="resource-item-top">
          <OIcon><component :is="item.icon" /></OIcon>
          <p class="title">{{ item.name }}</p>
        </div>
        <div class="resource-item-bottom">
          <p class="desc">{{ item.desc }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resource-content {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;

  .resource-panel {
    flex: 0 1 calc(25% - 24px);
    min-width: 0;
    background: var(--o-color-fill2);
    border-radius: 8px;
    padding: 24px;
    transition: all 0.3s ease;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }
  .resource-item {
    display: flex;
    flex-direction: column;
    height: 100%;
    &:hover {
      .title {
        color: var(--o-color-primary1);
      }
    }
    .resource-item-top {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .resource-item-bottom {
      flex: 1;
      display: flex;
      justify-content: flex-start;
      padding-top: 16px;
    }
    svg {
      width: 27px;
      height: 27px;
      color: var(--o-color-info1);
      transition: color 0.3s ease;
    }
    .title {
      @include h3;
      color: var(--o-color-info1);
      margin: 0 0 0 12px;
      font-weight: 500;
      font-size: 22px;
      line-height: 30px;
    }
    .desc {
      @include text1;
      color: var(--o-color-info3);
      max-width: 306px;
      text-align: left;
    }
  }
}
</style>
