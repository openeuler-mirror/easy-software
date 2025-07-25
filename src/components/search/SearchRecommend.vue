<script lang="ts" setup>
import { ref, watch, computed, type PropType } from 'vue';
import { OLink, OIcon, useMessage } from '@opensig/opendesign';
import type { RecommendItemT } from '@/@types/search';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { getTagsIcon, xssAllTag, getPkgName } from '@/utils/common';
import { GITEE } from '@/data/config';
import ExternalLink from '@/components/ExternalLink.vue';

import { useLocale } from '@/composables/useLocale';
import useSearchHistory from '@/composables/useSearchHistory';

import IconChevronRight from '~icons/app/icon-chevron-right.svg';
import { searchReport } from '@/shared/analytics';

const props = defineProps({
  searchValue: {
    type: String,
    default: '',
  },
  filterValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array as PropType<RecommendItemT[]>,
    default: () => [],
  },
  isFeedback: {
    type: Boolean,
    default: () => false,
  },
});
const msg = useMessage();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { locale } = useLocale();
const isShow = ref(props.isFeedback);

const isPageHome = computed(() => route.name === 'home');

const reportAnalytics = (data: Record<string, any>, event = 'click') => {
  searchReport(event, {
    module: isPageHome.value ? 'home_page' : 'search_page',
    content: props.searchValue,
    ...data,
    ...(route.query.tab ? { tab: route.query.tab } : {}),
  });
};

const jumpPages = (type: string) => {
  reportAnalytics({
    type: `search_${type}`,
  });
  router.push({
    path: `/${locale.value}/${getPkgName(type)}`,
    query: { name: props.searchValue },
  });
};

const goDetail = (ev: MouseEvent, key: string, id: string) => {
  const type = getPkgName(key);
  const pkgName = ['filed', 'rpm', 'epkg', 'image', 'oepkg', 'conda'];
  if (pkgName.includes(type)) {
    reportAnalytics({
      type: `suggest_${key}`,
      target: (ev.currentTarget as HTMLElement).textContent,
    });
    router.push({
      path: `/${locale.value}/${getPkgName(key)}/detail`,
      query: { type: type, pkgId: id },
    });
  } else {
    return msg.danger({
      content: '参数错误',
    });
  }
};

const goSearch = (name: string, isHistory?: boolean) => {
  if (!isHistory && isPageHome.value) {
    reportAnalytics({
      type: 'search',
    });
  }
  router.push({
    path: `/${locale.value}/search`,
    query: { name: `${xssAllTag(name)}`, tab: 'all', key: props.filterValue },
  });
};

// 一键反馈
const getIssueTemplate = () => {
  return `1. 【网站链接】%0A
> ${encodeURIComponent(window.location.href)}
%0A
2. 【反馈内容】%0A
> ${props.searchValue}
`;
};
const issueUrl = ref();

const getIssueUrl = () => {
  const desc = encodeURIComponent(getIssueTemplate());
  issueUrl.value = `${GITEE}/openeuler/easy-software/issues/new?issue%5Bassignee_id%5D=0&issue%5Bmilestone_id%5D=0&title=【搜索】-${props.searchValue}&description=${desc}`;
};

const showExternalDlg = ref(false);
const externalLink = ref('');
const clickFeedback = () => {
  getIssueUrl();
  externalLink.value = decodeURIComponent(issueUrl.value);
  showExternalDlg.value = true;
};

// -------------------- 历史搜索记录----------------------
const searchHistory = useSearchHistory();

watch(
  () => props.isFeedback,
  (v: boolean) => {
    isShow.value = v;
  }
);

const searchOptions = computed(() => {
  return props.options;
});

// 搜索数量>=10000 显示10000+
const DOCCOUNT = 10000;
const searchDocCount = (v: number) => {
  return v >= DOCCOUNT ? `${v}+` : `${v}个`;
};
</script>

<template>
  <div v-if="searchOptions.length > 0" class="recommend">
    <div v-for="(item, index) in searchOptions" :key="index" class="recommend-item">
      <div class="recommend-header">
        <p class="title">
          <OIcon class="icon"><component :is="getTagsIcon(item.key)" /></OIcon>
          {{ t(`software.${item.key}`) }}
        </p>
        <p class="info">
          <OLink @click="jumpPages(item.key)">
            {{ t('software.searchview[0]') }}{{ searchDocCount(item.docCount) }}{{ t('software.searchview[1]') }}{{ t(`software.${item.key}`) }}
            <template #suffix><IconChevronRight /></template>
          </OLink>
        </p>
      </div>
      <ul>
        <li
          v-for="(subitem, idx) in item.nameDocs"
          :key="idx"
          @click="goDetail($event, item.key, subitem.pkgId)"
          v-dompurify-html="`${subitem.name} ${subitem.version ? `:${subitem.version}` : ''}`"
        ></li>
      </ul>
    </div>
    <div class="search-all">
      <OLink @click="goSearch(searchValue)">
        {{ t('software.viewAllSearch') }}
        <template #suffix><IconChevronRight /></template>
      </OLink>
    </div>
  </div>
  <div v-else-if="searchHistory.list.value.length > 0 && searchValue === ''" class="recommend">
    <span class="history">{{ t('software.history') }}</span>
    <ul>
      <li v-for="(item, index) in searchHistory.list.value" :key="index" @click="goSearch(item, true)">{{ item }}</li>
    </ul>
  </div>
  <div v-else-if="searchOptions.length === 0 && isShow" class="recommend">
    <span class="text">{{ t('software.nofound') }}</span>
    <p class="nofound">
      {{ t('software.nofoundApp') }} <OLink color="primary" @click="clickFeedback"> {{ t('software.feedback') }}</OLink>
    </p>
    <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
  </div>
</template>

<style lang="scss" scoped>
.recommend {
  position: absolute;
  z-index: 99;
  top: 52px;
  width: 100%;
  background-color: var(--o-color-control-light);
  box-shadow: var(--o-shadow-2);
  height: auto;
  padding: 16px 16px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  .search-all {
    display: flex;
    align-items: center;
    justify-content: center;
    @include tip1;
    color: var(--o-color-info1);
    svg {
      width: 16px;
      fill: currentColor;
    }
  }
  .recommend-item {
    &:not(:last-child) {
      border-bottom: 1px solid var(--o-color-control4);
      margin-bottom: 12px;
      padding-bottom: 12px;
    }
  }
  .recommend-header {
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    align-items: center;
    margin-bottom: 8px;
    .title {
      @include tip2;
      display: flex;
      align-items: center;
      color: var(--o-color-info3);
      .icon {
        margin-right: 4px;
      }
      svg {
        width: 16px;
        height: 16px;
        color: currentColor;
      }
    }
    .info {
      @include tip2;
      color: var(--o-color-info2);
      svg {
        width: 16px;
        fill: currentColor;
      }
    }
  }
  .text {
    padding: 0 0 8px;
    display: block;
    color: var(--o-color-info1);
  }
  .nofound {
    color: var(--o-color-info1);
  }
  .history {
    @include tip2;
    color: var(--o-color-info3);
    padding: 0 0 8px;
    display: block;
  }
  li {
    @include tip1;
    color: var(--o-color-info1);
    padding: 4px 12px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 4px;
    &:hover {
      background: var(--o-color-control2-light);
    }
    :deep(span) {
      color: var(--o-color-primary1);
    }
  }
}
</style>
