<script lang="ts" setup>
import { vLoading, OLink, ORow, OCol, OIcon, OAnchor, OAnchorItem } from '@opensig/opendesign';
import { ref, onMounted } from 'vue';
import { getSearchAllFiled } from '@/api/api-domain';
import type { AppT } from '@/@types/app';
import HomeHeader from './HomeHeader.vue';
import HomeNews from './HomeNews.vue';
import HomeSkeleton from './HomeSkeleton.vue';
import { solutionData, homeData } from '@/data/home/index';
import { useLocale } from '@/composables/useLocale';
import { useScreen } from '@/composables/useScreen';
import IconChevronDown from '~icons/app/icon-chevron-right.svg';

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

// Hover 修改资源icon 颜色
const resourceHover = (id: string) => {
  const path = document.querySelector(`.resource-item #${id}-icon`);
  if (path) {
    path.setAttribute('fill', '#002fa7');
  }
};
const resourceLeave = (id: string) => {
  const path = document.querySelector(`.resource-item #${id}-icon`);
  if (path) {
    path.setAttribute('fill', '');
  }
};

onMounted(() => {
  queryAllpkg();
});
</script>

<template>
  <div>
    <HomeHeader />
    <ContentWrapper vertical-padding="72px">
      <div ref="pkgRef" v-loading.nomask="isLoading" class="pkg-wrap">
        <div v-if="size.width > 1900 && pkgData && pkgData.length" class="anchor">
          <OAnchor container="#app > .o-scroller > .o-scroller-container">
            <OAnchorItem href="#all" title="领域应用">
              <OAnchorItem v-for="item in pkgData" :key="item.name" :href="'#' + item.name" :title="item.name" />
            </OAnchorItem>
            <OAnchorItem href="#resource" title="获取资源" />
            <OAnchorItem href="#solution" title="解决方案" />
            <OAnchorItem href="#news" title="最新资讯" />
          </OAnchor>
        </div>
        <div class="pkg-main">
          <h2>领域应用</h2>
          <div v-if="pkgData.length > 0" id="all" class="pkg-content">
            <div v-for="item in pkgData" :key="item.name" class="domain-item">
              <template v-if="item.children?.length > 0">
                <div class="domain-item-title">
                  <h3 :id="item.name">{{ item.name }}</h3>
                  <OLink :href="`/${locale}/apppkg?type=${item.name}`">
                    了解更多
                    <template #suffix
                      ><OIcon><IconChevronDown /></OIcon
                    ></template>
                  </OLink>
                </div>
                <ORow gap="32px" flex-wrap="wrap">
                  <OCol
                    v-for="subItem in item.children.slice(0, 4)"
                    :key="subItem.name"
                    flex="0 1 25%"
                    :laptop="{ flex: '0 1 25%' }"
                    :pad="{ flex: '0 1 50%' }"
                    :pad-v="{ flex: '0 1 100%' }"
                    :phone="{ flex: '0 1 100%' }"
                  >
                    <OCardItem :data="subItem" />
                  </OCol>
                </ORow>
              </template>
            </div>
          </div>
          <div v-else class="pkg-content">
            <HomeSkeleton />
          </div>

          <div id="resource" class="domain-resource">
            <h2>获取资源</h2>
            <div class="resource-content">
              <div v-for="item in homeData" :key="item.name" class="resource-panel">
                <RouterLink :to="`/${locale}${item.href}`" class="resource-item" @mouseenter="resourceHover(item.id)" @mouseleave="resourceLeave(item.id)">
                  <OIcon><component :is="item.icon" /></OIcon>
                  <p class="title">{{ item.name }}</p>
                  <p class="desc">{{ item.desc }}</p>
                </RouterLink>
              </div>
            </div>
          </div>

          <div id="solution" class="domain-solution">
            <h2>解决方案</h2>
            <div class="solution-content">
              <a v-for="item in solutionData" :key="item.title" class="solution-item" :href="`/${locale}` + item.href">
                <div class="cover">
                  <img :src="item.img" alt="" />
                </div>
                <div class="solution-content-box">
                  <h3>{{ item.title }}</h3>
                  <p class="desc">{{ item.desc }}</p>
                </div>
              </a>
            </div>
          </div>

          <div id="news" class="domain-news">
            <h2>最新资讯</h2>
            <HomeNews />
          </div>
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
.resource-content {
  background: var(--o-color-fill2);
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .resource-panel {
    flex: 1;
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
      @include h2;
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

.pkg-main {
  h2 {
    @include display3;
    text-align: center;
    font-weight: 500;
    margin-bottom: 32px;
  }
}

.pkg-wrap {
  min-height: 500px;
}
.anchor {
  height: 0;
  overflow: visible;
  position: sticky;
  top: 0;
  transform: translate(-180px, 70px);
  width: -moz-max-content;
  width: max-content;
  left: 5%;
  z-index: 9;
}

.slides2 {
  width: 100%;
  margin: auto;
  height: 400px;
  overflow: hidden;

  .img {
    position: absolute;
    z-index: -1;
  }
  .slide2-slide-content {
    width: 100%;
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .title {
      @include h2;
      color: #fff;
      margin-bottom: 16px;
    }
    .desc {
      @include text2;
      color: #fff;
      max-width: 600px;
    }
  }
}
.domain-item-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  .o-link {
    @include text1;
  }
}
.domain-solution,
.domain-resource,
.domain-news {
  margin-top: 64px;
}
.solution-content {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  .solution-item {
    background: var(--o-color-fill2);
    height: 260px;
    display: flex;
    justify-content: space-between;
    transition: box-shadow var(--o-easing-standard) var(--o-duration-m2);
    &:hover {
      box-shadow: 0 2px 24px rgba(var(--o-kleinblue-10), 0.15);
      h3 {
        color: var(--o-color-primary1);
      }
    }
  }
  .cover {
    width: 260px;
    height: 100%;
    overflow: hidden;
    img {
      max-width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .solution-content-box {
    flex: 1;
    padding: 48px 32px;
    position: relative;
    h3 {
      @include h2;
      font-weight: 500;
      color: var(--o-color-info1);
      margin-bottom: 32px;
    }
    .desc {
      @include text1;
      margin-top: 16px;
      color: var(--o-color-info2);
    }
    .o-btn {
      position: absolute;
      bottom: 24px;
      left: 32px;
    }
  }
}
.domain-item {
  margin: 0 0 32px;
  h3 {
    @include h2;
    text-align: center;
    font-weight: 500;
  }
}
.more {
  margin-top: 24px;
  text-align: center;
  .more-box {
    display: inline-block;
    cursor: pointer;
  }
  .more-text {
    display: flex;
    justify-content: center;
    align-items: center;
    @include text1;
  }
  .o-icon {
    color: var(--o-color-primary1);
  }
}
</style>
