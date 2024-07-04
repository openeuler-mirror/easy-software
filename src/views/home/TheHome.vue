<script lang="ts" setup>
import { OAnchor, OAnchorItem } from '@opensig/opendesign';
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
</style>
