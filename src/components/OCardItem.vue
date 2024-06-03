<script lang="ts" setup>
import type { PropType } from 'vue';
import { OCard, OTag, OIcon } from '@opensig/opendesign';
import type { AppItemT, PkgIdsT, PkgTypeT } from '@/@types/app';
import { getTagsIcon } from '@/utils/common';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';

import defaultImg from '@/assets/default-logo.png';

defineProps({
  data: {
    type: Object as PropType<AppItemT>,
    default: () => {},
  },
});

const { locale } = useLocale();
const { t } = useI18n();
const jumpTo = (id: PkgIdsT, type?: PkgTypeT) => {
  return `/${locale.value}/apppkg/detail?${type ? `type=${type}` : ''}${id.IMAGE ? `&appPkgId=${encodeURIComponent(id.IMAGE)}` : ''}${
    id.EPKG ? `&epkgPkgId=${encodeURIComponent(id.EPKG)}` : ''
  }${id.RPM ? `&rpmPkgId=${encodeURIComponent(id.RPM)}` : ''}`;
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
};
</script>

<template>
  <OCard
    :style="{
      height: '100%',
      '--card-main-padding': '24px',
    }"
    hoverable
  >
    <template #main>
      <div class="pkg-info">
        <a :href="jumpTo(data.pkgIds)" target="_blank" rel="noopener noreferrer" v-dompurify-html="data.name" class="name"></a>
        <div class="pkg-icon"><img :src="data.iconUrl || defaultImg" class="icon" :class="{ 'default-img': !data.iconUrl }" /></div>
      </div>
      <div class="pkg-box">
        <div v-if="data.tags && data.tags.length > 0" class="tags-box">
          <a :href="jumpTo(data.pkgIds, tag)" v-for="tag in data.tags" :key="tag" target="_blank" rel="noopener noreferrer">
            <OTag style="--o-icon_size_control-xs: 0" variant="outline" :class="`${tag.toLocaleLowerCase()}-icon`">
              <template #icon>
                <OIcon><component :is="getTagsIcon(tag)" /></OIcon>
              </template>
              {{ repeatTags(tag) }}
            </OTag>
          </a>
        </div>
        <p v-if="data.description" v-dompurify-html="data.description" class="desc"></p>
      </div>
    </template>
  </OCard>
</template>

<style lang="scss" scoped>
.o-card-main {
  width: 100%;
  position: relative;
  height: 100%;
  --card-main-padding: 24px;
  &:hover {
    .name {
      color: var(--o-color-primary1);
    }
  }

  .pkg-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .pkg-icon {
    height: 32px;
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .name {
    @include h3;
    color: var(--o-color-info1);
    flex: 1;
    word-break: break-word;
    font-weight: 500;
    span {
      color: var(--o-color-primary1);
    }
  }
  .pkg-box {
    height: 102px;
    .desc {
      @include text1;
      margin-top: 16px;
      color: var(--o-color-info2);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      position: relative;
      word-break: break-all;
      span {
        color: var(--o-color-primary1);
      }
      &::after {
        background-image: linear-gradient(90deg, hsla(0, 0%, 93%, 0), hsla(0, 0%, 100%, 0.8) 59%, var(--o-color-control-light) 100%);
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
}
</style>
