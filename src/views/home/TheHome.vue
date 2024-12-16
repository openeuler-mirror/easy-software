<script lang="ts" setup>
import { OAnchor, OAnchorItem, OCard } from '@opensig/opendesign';
import { ref, onMounted, onUnmounted } from 'vue';
import { getSearchAllFiled } from '@/api/api-domain';
import type { AppT } from '@/@types/app';
import HomeHeader from './HomeHeader.vue';
import HomeNews from './HomeNews.vue';
import HomeVersion from './HomeVersion.vue';
import HomeField from './HomeField.vue';
import HomeResource from './HomeResource.vue';
import { solutionData } from '@/data/home/index';
import { useLocale } from '@/composables/useLocale';
import { useScreen } from '@/composables/useScreen';

const { size } = useScreen();
const { locale } = useLocale();
const pkgData = ref<AppT[]>([]);
const isLoading = ref(false);
const queryAllpkg = () => {
  const params = {
    name: 'mainPage',
    pageSize: 10,
    pageNum: 1,
  };
  isLoading.value = true;
  getSearchAllFiled(params)
    .then((res) => {
      pkgData.value = res.data;
      isLoading.value = false;
    })
    .catch(() => {
      pkgData.value = [];
      isLoading.value = false;
    });
};

// -------------------- 滚动头部搜索显示隐藏 --------------------
let oscrollDom = document.querySelector('#app > .o-scroller > .o-scroller-container');
let headDom = document.querySelector('.app-header');
const onScroll = (e: Event) => {
  if (!headDom) {
    headDom = document.querySelector('.app-header');
  }
  const { scrollTop } = e.target as HTMLElement;
  const targetDom = document.querySelector('#all');

  if (scrollTop >= (targetDom as HTMLElement)?.offsetTop) {
    headDom.classList.add('search-show');
  } else {
    headDom.classList.remove('search-show');
  }
};

onMounted(() => {
  oscrollDom?.addEventListener('scroll', onScroll, { passive: true });
  queryAllpkg();
});

onUnmounted(() => {
  headDom.classList.remove('search-show');
  oscrollDom?.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div>
    <HomeHeader :class="{ show: isShow }" />
    <ContentWrapper vertical-padding="72px">
      <div ref="pkgRef" class="pkg-wrap">
        <div v-if="size.width > 1900 && pkgData && pkgData.length" class="anchor">
          <OAnchor container="#app > .o-scroller > .o-scroller-container" :target-offset="104">
            <OAnchorItem href="#all" title="领域应用">
              <OAnchorItem v-for="item in pkgData" :key="item.name" :href="'#' + item.name" :title="item.name" />
            </OAnchorItem>
            <OAnchorItem href="#resource" title="获取资源" />
            <OAnchorItem href="#solution" title="解决方案" />
            <OAnchorItem href="#version" title="openEuler社区版本" />
            <OAnchorItem href="#news" title="最新资讯" />
          </OAnchor>
        </div>
        <div id="all" class="pkg-main">
          <div class="pkg-title"><h2>领域应用</h2></div>
          <HomeField :data="pkgData" />
          <div id="resource" class="domain-resource">
            <div class="pkg-title"><h2>获取资源</h2></div>
            <HomeResource />
          </div>

          <div id="solution" class="domain-solution">
            <div class="pkg-title">
              <h2>解决方案</h2>
              <p class="text">通过提供一系列软件工具和技术方案，提供高效、稳定和可扩展的软件产品和服务</p>
            </div>
            <div class="solution-content">
              <OCard
                v-for="item in solutionData"
                :key="item.title"
                class="solution-item"
                :href="`/${locale}` + item.href"
                :cover="item.img"
                :cover-ratio="1 / 1"
                :title="item.title"
                :detail="item.desc"
                layout="h"
              />
            </div>
          </div>

          <div id="version" class="domain-news">
            <div class="pkg-title"><h2>openEuler社区版本</h2></div>
            <HomeVersion />
          </div>
          <div id="news" class="domain-news">
            <div class="pkg-title">
              <h2>最新资讯</h2>
            </div>
            <HomeNews />
          </div>
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
.pkg-main {
  .pkg-title {
    margin-bottom: 32px;
    text-align: center;
    h2 {
      @include display3;
      font-weight: 500;
      color: var(--o-color-info1);
    }
    .text {
      @include h4;
      margin-top: 16px;
      color: var(--o-color-info2);
    }
  }
}

.pkg-wrap {
  min-height: 500px;
}
.anchor {
  height: 0;
  overflow: visible;
  position: sticky;
  top: 40px;
  transform: translate(-180px, 70px);
  width: -moz-max-content;
  width: max-content;
  left: 5%;
  z-index: 9;
}

.domain-solution,
.domain-resource,
.domain-news {
  margin-top: 64px;
}
.solution-content {
  display: flex;
  justify-content: space-between;
  .solution-item {
    height: 260px;
    flex: 1;
    &:hover {
      h3 {
        color: var(--o-color-primary1);
      }
    }
    --card-h-cover-width: 260px;
    --card-main-padding: 40px 32px;
  }
  .solution-item + .solution-item {
    margin-left: 32px;
  }
}
</style>
