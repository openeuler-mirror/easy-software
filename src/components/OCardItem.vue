<script lang="ts" setup>
import { type PropType, ref, onMounted } from 'vue';
import { OCard, OTag, OIcon } from '@opensig/opendesign';
import type { AppItemT, PkgIdsT, PkgTypeT } from '@/@types/app';
import { getTagsIcon } from '@/utils/common';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import defaultImg from '@/assets/default-logo.png';

const props = defineProps({
  data: {
    type: Object as PropType<AppItemT>,
    default: () => {},
  },
});
const route = useRoute();
const { locale } = useLocale();
const { t } = useI18n();

function getQueryString(params: PkgIdsT) {
  let queryStr = '';

  if (params.RPM) {
    queryStr += `&rpmPkgId=${encodeURIComponent(params.RPM)}`;
  }
  if (params.IMAGE) {
    queryStr += `&appPkgId=${encodeURIComponent(params.IMAGE)}`;
  }
  if (params.EPKG) {
    queryStr += `&epkgPkgId=${encodeURIComponent(params.EPKG)}`;
  }
  if (params.OEPKG) {
    queryStr += `&oepkgPkgId=${encodeURIComponent(params.OEPKG)}`;
  }
  return queryStr.replace(/^&/, '');
}

const jumpTo = (id: PkgIdsT, type?: PkgTypeT) => {
  return `/${locale.value}/apppkg/detail?${type ? `type=${type}` : ''}${getQueryString(id)}`;
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
};

// 埋点
const getSensorsData = (href: string) => {
  const sensors = (window as any)['sensorsDataAnalytic201505'];
  const downloadTime = new Date();
  sensors?.setProfile({
    ...(window as any)['sensorsCustomBuriedData'],
    profileType: 'hot',
    origin: href,
    softwareName: props.data.name,
    os: props.data.os,
    arch: props.data.arch,
    category: props.data.category,
    version: props.data.version,
    downloadTime,
    language: 'zh',
  });
};

// 判断是否是搜索页
const isPageSearch = ref(false);
const isPageHome = ref(false);
onMounted(() => {
  isPageSearch.value = route.name === 'search';
  isPageHome.value = route.name === 'home';
});
</script>

<template>
  <OCard
    :style="{
      height: '100%',
      '--card-main-padding': '24px',
    }"
    hoverable
    :class="{ search: isPageSearch, home: isPageHome }"
  >
    <template #main>
      <div class="pkg-info">
        <a :href="jumpTo(data.pkgIds)" target="_blank" rel="noopener noreferrer" class="name-info">
          <span v-dompurify-html="data.name" class="name"></span><span v-if="data.arch" class="arch">/{{ data.arch }}</span>
        </a>
        <div class="pkg-icon"><img :src="data.iconUrl || defaultImg" class="icon" :class="{ 'default-img': !data.iconUrl }" /></div>
      </div>
      <p v-if="data.os" class="pkg-os">{{ data.os }}</p>
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
.search .name-info {
  .name span {
    color: var(--o-color-primary1);
  }
}
.home {
  .arch,
  .pkg-os {
    display: none;
  }
}
.o-card-main {
  width: 100%;
  position: relative;
  height: 100%;
  --card-main-padding: 24px;
  &:hover {
    .name-info {
      color: var(--o-color-primary1);
    }
  }
  .pkg-os {
    font-size: 12px;
    line-height: 18px;
    color: var(--o-color-info2);
    margin-top: 6px;
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
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .name-info {
    @include h3;
    color: var(--o-color-info1);
    flex: 1;
    word-break: break-word;
    font-weight: 500;
  }
  .pkg-box {
    .tags-box {
      margin-top: 24px;
    }
    .desc {
      @include text1;
      margin-top: 8px;
      color: var(--o-color-info2);
      overflow: hidden;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      position: relative;
      word-break: break-all;
      height: 48px;
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
