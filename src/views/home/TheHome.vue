<script lang="ts" setup>
import { OAnchor, OAnchorItem, OCard } from '@opensig/opendesign';
import { ref, onMounted } from 'vue';
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
      const { data } = res;
      let preview: AppT[] = [];
      data.forEach(function (item, index) {
        if (item.name === '其他') {
          preview = data.splice(index, 1);
          index--;
        }
      });
      pkgData.value = preview.length > 0 ? data.concat(preview) : data;
      isLoading.value = false;
    })
    .catch(() => {
      pkgData.value = [];
      isLoading.value = false;
    });
};

onMounted(() => {
  queryAllpkg();
});
</script>

<template>
  <div>
    <HomeHeader />
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
          <h2>领域应用</h2>
          <HomeField :data="pkgData" />
          <div id="resource" class="domain-resource">
            <h2>获取资源</h2>
            <HomeResource />
          </div>

          <div id="solution" class="domain-solution">
            <h2>解决方案</h2>
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
            <h2>openEuler社区版本</h2>
            <HomeVersion />
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
