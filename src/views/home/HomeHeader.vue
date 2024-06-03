<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ODivider } from '@opensig/opendesign';
import { getStat } from '@/api/api-domain';

import SearchFilter from '@/components/search/SearchFilter.vue';

// -------------------- 社区应用数据接口 --------------------
const total = ref(0);
const apppkg = ref();
const queryStat = () => {
  getStat().then((res) => {
    total.value = res.data.total;
    apppkg.value = res.data.apppkg;
  });
};

const actionVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    actionVisible.value = true;
  }, 0);
});

onMounted(() => {
  queryStat();
});
</script>

<template>
  <div class="head-wrap">
    <div class="community-content">
      <h1 :class="{ action: actionVisible }">openEuler软件中心</h1>
      <p class="slog" :class="{ action: actionVisible }">用最easy的方式帮助每个开发者找到自己想要的</p>

      <div :class="{ action: actionVisible }" class="community-pkg">
        <span class="num">{{ apppkg }}</span>
        容器镜像
        <ODivider direction="v" style="--o-divider-bd-color: #fff" />
        <span class="num">{{ total }}</span> 软件包
      </div>
    </div>
    <SearchFilter :class="{ action: actionVisible }" class="home-search" />
  </div>
</template>

<style lang="scss" scoped>
.head-wrap {
  background: var(--o-color-primary1) url(@/assets/banner.jpg) no-repeat top center/cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  height: 280px;
  position: relative;
  z-index: 99;
}
.home-search {
  transform: translateY(100px);
  opacity: 0;
  &.action {
    transition: all 1500ms 0.25s var(--o-easing-standard-in);
    transform: translateY(0);
    opacity: 1;
  }
}
.community-content {
  flex: 1;
  text-align: center;
  .community-pkg {
    @include text1;
    color: var(--o-color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(100px);
    opacity: 0;
    &.action {
      transition: all 1500ms 0.25s var(--o-easing-standard-in);
      transform: translateY(0);
      opacity: 1;
    }
    .num {
      @include text1;
      margin: 0 3px;
      font-weight: 700;
    }
  }
  h1 {
    @include display3;
    font-weight: 500;
    color: var(--o-color-white);
    transform: translateY(100px);
    opacity: 0;

    &.action {
      transition: all 1500ms 0.1s var(--o-easing-standard-in);
      transform: translateY(0);
      opacity: 1;
    }
  }
  .slog {
    @include tip1;
    font-weight: 500;
    color: var(--o-color-white);
    margin: 8px 0;
    transform: translateY(100px);
    opacity: 0;
    &.action {
      transition: all 1500ms 0.15s var(--o-easing-standard-in);
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>
