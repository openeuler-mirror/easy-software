<script lang="ts" setup>
import { type PropType, ref, onMounted } from 'vue';
import { OCard, OTag, OIcon } from '@opensig/opendesign';
import type { AppItemT, PkgIdsT, PkgTypeT } from '@/@types/app';
import { getTagsIcon } from '@/utils/common';
import { useLocale } from '@/composables/useLocale';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { maintainerDefaults } from '@/data/query';

import defaultImg from '@/assets/default-logo.png';
import IconUser from '~icons/app/icon-user.svg';

defineProps({
  data: {
    type: Object as PropType<AppItemT>,
    default: () => {},
  },
});
const route = useRoute();
const { locale } = useLocale();
const { t } = useI18n();
const { isDark } = useTheme();

// 名称转换
const pkgNameConversion = (v: string) => {
  return v === 'IMAGE' ? 'app' : v.toLocaleLowerCase();
};

// 跳转id
function getQueryStr(params: PkgIdsT) {
  if (Object.entries(params).length > 0) {
    const ids = Object.entries(params)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${pkgNameConversion(key)}PkgId=${encodeURIComponent(value)}`);

    return ids.join('&').replace(/^&/, '');
  }
}

// Maintainer数据
function getMaintainersStr(params: PkgIdsT) {
  const line = ' ; ';
  const defaultName = maintainerDefaults.name;
  if (params && Object.entries(params).length > 0) {
    const maintainers = Object.entries(params).map(([key, value]) => (value ? value : defaultName));
    // 去重
    const uniqueVal = [...new Set(maintainers)];
    return uniqueVal.join(line).replace(/ ; +$/, '');
  } else {
    return defaultName;
  }
}

const jumpTo = (id: PkgIdsT, type?: PkgTypeT) => {
  return `/${locale.value}/field/detail?${type ? `type=${type}&` : ''}${getQueryStr(id)}`;
};

const repeatTags = (v: string) => {
  return v.toLocaleLowerCase() === 'image' ? t('software.apppkg') : v;
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
    class="o-card-pkg"
    :class="{ search: isPageSearch, home: isPageHome }"
  >
    <template #main>
      <div class="pkg-info">
        <a :href="jumpTo(data.pkgIds)" target="_blank" rel="noopener" class="name-info">
          <span v-dompurify-html="data.name" class="name"></span><span v-if="data.arch" class="arch">/{{ data.arch }}</span>
        </a>
        <div class="pkg-icon"><img :src="data.iconUrl || defaultImg" class="icon" :class="{ 'default-img': !data.iconUrl }" /></div>
      </div>
      <p v-if="data.os" class="pkg-os">{{ data.os }}</p>
      <div class="pkg-box">
        <div v-if="data.tags && data.tags.length > 0" class="tags-box">
          <a :href="jumpTo(data.pkgIds, tag)" v-for="tag in data.tags" :key="tag" target="_blank" rel="noopener">
            <OTag style="--o-icon_size_control-xs: 0" variant="outline" :class="`${tag.toLocaleLowerCase()}-icon`">
              <template #icon>
                <OIcon><component :is="getTagsIcon(tag)" /></OIcon>
              </template>
              {{ repeatTags(tag) }}
            </OTag>
          </a>
        </div>
        <p v-if="data.description" v-dompurify-html="data.description" class="desc" :class="{ dark: isDark }"></p>
        <p class="maintainers">
          <OIcon><IconUser /></OIcon>{{ getMaintainersStr(data.maintainers) }}
        </p>
      </div>
    </template>
  </OCard>
</template>

<style lang="scss" scoped>
.home {
  .o-card-main {
    .arch,
    .pkg-os {
      display: none;
    }
    .pkg-icon {
      align-items: center;
    }
    .pkg-info {
      height: auto;
      align-items: center;
    }
    .name-info {
      height: inherit;
    }
  }
}

:deep(.o-card-main) {
  justify-content: space-between;
  &:hover {
    .name-info {
      color: var(--o-color-primary1);
    }
  }
  .pkg-os {
    @include tip1;
    color: var(--o-color-info2);
    margin-top: 6px;
  }
  .pkg-info {
    display: flex;
    height: 60px;
    align-items: flex-start;
  }
  .pkg-icon {
    height: 32px;
    width: 64px;
    display: flex;
    align-items: flex-start;
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
    transition: all 0.3s ease;
    display: -webkit-box;
    height: 60px;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    position: relative;
    word-break: break-all;
    .name span {
      color: var(--o-color-primary1);
    }
  }
  .pkg-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .tags-box {
      margin-top: 24px;
    }
    .maintainers {
      @include tip1;
      color: var(--o-color-info3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      margin-top: 16px;
      .o-icon {
        margin-right: 8px;
        color: var(--o-color-info3);
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}
</style>
