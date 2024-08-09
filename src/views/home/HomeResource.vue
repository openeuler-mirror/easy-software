<script lang="ts" setup>
import { OIcon } from '@opensig/opendesign';
import { homeData } from '@/data/home/index';
import { useLocale } from '@/composables/useLocale';

const { locale } = useLocale();

// Hover 修改资源icon 颜色
const resourceHover = (id: string) => {
  const path = document.querySelector(`.resource-item #${id}-icon`);
  if (path) {
    path.setAttribute('fill', 'var(--o-color-primary1)');
  }
};
const resourceLeave = (id: string) => {
  const path = document.querySelector(`.resource-item #${id}-icon`);
  if (path) {
    path.setAttribute('fill', '');
  }
};
</script>

<template>
  <div class="resource-content">
    <div v-for="item in homeData" :key="item.name" class="resource-panel">
      <RouterLink :to="`/${locale}${item.href}`" class="resource-item" @mouseenter="resourceHover(item.id)" @mouseleave="resourceLeave(item.id)">
        <OIcon><component :is="item.icon" /></OIcon>
        <p class="title">{{ item.name }}</p>
        <p class="desc">{{ item.desc }}</p>
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resource-content {
  background: var(--o-color-fill2);
  padding: 42px;
  display: flex;
  justify-content: space-between;

  .resource-panel {
    flex: 1;
  }
  .resource-panel + .resource-panel {
    margin-left: 32px;
  }
  .resource-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    &:hover {
      .title {
        color: var(--o-color-primary1);
      }
    }
    svg {
      width: 56px;
      height: 56px;
      color: var(--o-color-info1);
    }
    .title {
      @include h3;
      color: var(--o-color-info1);
      margin: 16px 0 12px;
      font-weight: 500;
    }
    .desc {
      @include text1;
      color: var(--o-color-info2);
      max-width: 306px;
      text-align: center;
    }
  }
}
</style>
