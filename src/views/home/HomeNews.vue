<script lang="ts" setup>
import { OCard, OTag, ORow, OCol } from '@opensig/opendesign';

import { useTheme } from '@/composables/useTheme';
import { homeNewsData } from '@/data/home/index';

const { isDark } = useTheme();
</script>

<template>
  <ORow gap="32px" flex-wrap="wrap">
    <OCol
      v-for="subItem in homeNewsData"
      :key="subItem.title"
      flex="0 1 33%"
      :laptop="{ flex: '0 1 33%' }"
      :pad="{ flex: '0 1 50%' }"
      :pad-v="{ flex: '0 1 100%' }"
      :phone="{ flex: '0 1 100%' }"
    >
      <OCard
        :href="subItem.url"
        class="news-item"
        target="_blank"
        rel="noopener noreferrer"
        :title="subItem.title"
        :title-row="2"
        :cover="subItem.banner"
        hoverable
      >
        <template #default>
          <div class="tag-box">
            <OTag v-for="tag in subItem.tags" :key="tag">{{ tag }}</OTag>
          </div>
        </template>

        <template #footer>
          <div class="desc" :class="{ dark: isDark }">
            {{ subItem.summary }}
          </div>
        </template>
      </OCard>
    </OCol>
  </ORow>
</template>

<style lang="scss" scoped>
:deep(.o-card) {
  --card-footer-gap: 16px;
  .o-card-cover {
    --card-cover-padding: 0;
  }
  &:hover {
    .o-card-title {
      color: var(--o-color-primary1);
    }
  }
  .o-figure {
    img {
      height: 255px;
    }
  }
  .desc {
    display: flex;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    position: relative;
    --linear-gradient: var(--o-mixedgray-1);
    &.dark {
      --linear-gradient: var(--o-mixedgray-4);
    }

    @include text1;
    &::after {
      background-image: linear-gradient(90deg, rgba(var(--linear-gradient), 0), rgba(var(--linear-gradient), 0.8) 59%, var(--o-color-control-light) 100%);
      bottom: 0;
      content: '';
      height: 24px;
      pointer-events: none;
      position: absolute;
      right: 0;
      width: 4em;
    }
  }
}

:deep(.o-card-main) {
  width: 100%;
  position: relative;
  align-items: center;
  min-height: 144px;
  .pkg-icon {
    width: 100px;
    height: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    img {
      max-width: 100%;
      border-radius: 8px;
    }
    .default-img {
      width: 48px;
      border-radius: 8px;
      height: 48px;
      opacity: 0.9;
    }
  }
  .pkg-box {
    flex: 1;
    padding-left: 16px;
    .name {
      @include h3;
      color: var(--o-color-info1);
      span {
        color: var(--o-color-primary1);
      }
    }
    .desc {
      @include text1;
      margin-top: 12px;
      color: var(--o-color-info2);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;

      span {
        color: var(--o-color-primary1);
      }
    }
  }
}
</style>
