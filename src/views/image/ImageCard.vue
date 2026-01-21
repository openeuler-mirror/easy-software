<script lang="ts" setup>
import { type PropType, ref, onMounted } from 'vue';
import { OCard, OTag, OIcon } from '@opensig/opendesign';
import type { AppItemT, PkgIdsT } from '@/@types/app';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

import defaultImg from '@/assets/default-logo.png';
import IconCategory from '~icons/pkg/icon-category.svg';

const props = defineProps({
  data: {
    type: Object as PropType<AppItemT>,
    default: () => {},
  },
  fieldName: {
    type: String,
    required: false,
  },
});
const route = useRoute();
const { isDark } = useTheme();

const jumpTo = (id: PkgIdsT) => {
  return `/zh/image/detail?pkgId=${id}`;
};

// 判断是否是搜索页
const isPageSearch = ref(false);

onMounted(() => {
  isPageSearch.value = route.name === 'search';
});

const reportAnalytics = (data: Record<string, any>, event = 'click') => {
  let module: string;
  if (isPageSearch.value) {
    module = 'search_page';
  } else {
    module = 'image';
  }
  if (isPageSearch.value) {
    (window as any).__OA_REPORT__?.(
      event,
      {
        module,
        app_name: xssAllTag(props.data.name),
        version: props.data.version,
        os_version: props.data.os,
        architecture: props.data.arch,
        ...data,
      },
      'search-software',
      { immediate: true }
    );
    return;
  }
  (window as any).__OA_REPORT__?.(
    event,
    {
      module,
      app_name: xssAllTag(props.data.name),
      version: props.data.version,
      os_version: props.data.os,
      architecture: props.data.arch,
      ...data,
    },
    { immediate: true }
  );
};

const onClickLink = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;

  if (isPageSearch.value) {
    const tab = route.query.tab ?? route.query?.type ?? '';
    const content = route.query?.name ?? route.query?.q ?? '';
    reportAnalytics({
      tab,
      type: 'search_content',
      target: target.textContent,
      content,
    });
    return;
  }

  reportAnalytics({
    type: 'go_detail',
    target: target.textContent,
  });
};
</script>

<template>
  <OCard
    :style="{
      height: '100%',
      '--card-main-padding': '24px',
    }"
    hoverable
    class="o-card-pkg"
    :class="{ search: isPageSearch }"
  >
    <template #main>
      <div class="pkg-info">
        <a :href="jumpTo(data.pkgId)" @click="onClickLink" target="_blank" rel="noopener" class="name-info">
          <span v-dompurify-html="data.name" class="name"></span>
        </a>
        <div class="pkg-icon"><img :src="data.iconUrl || defaultImg" class="icon" :class="{ 'default-img': !data.iconUrl }" /></div>
      </div>
      <div class="pkg-box">
        <p v-if="data.description" v-dompurify-html="data.description" class="desc" :class="{ dark: isDark }"></p>
        <p v-if="data.category" class="category">
          <OTag variant="outline">
            <OIcon><IconCategory /></OIcon>{{ data.category }}
          </OTag>
        </p>
      </div>
    </template>
  </OCard>
</template>

<style lang="scss" scoped>
:deep(.o-card-main) {
  &:hover {
    .name-info {
      color: var(--o-color-primary1);
    }
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
    .desc {
      margin-bottom: 12px;
      -webkit-line-clamp: 3;
      height: 72px;
    }
    .category {
      margin-top: 6px;
      color: var(--o-color-info2);

      @include tip1;
      .o-tag-label {
        display: flex;
        align-items: center;
        .o-icon {
          font-size: 16px;
          margin-right: 4px;
          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
}
</style>
