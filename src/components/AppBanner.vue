<script setup lang="ts">
import { type CSSProperties, computed, ref } from 'vue';

const props = defineProps({
  backgroundImage: {
    type: String,
    default: '',
  },
  backgroundColor: {
    type: String,
    default: '',
  },
  backgroundText: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  illustration: {
    type: String,
    default: '',
  },
});
const rootStyle = computed(() => {
  const result: CSSProperties = {};

  if (props.backgroundColor) {
    result.backgroundColor = props.backgroundColor;
  }
  return result;
});
const bannerElement = ref();

const elementHeight = computed(() => {
  return bannerElement.value?.offsetHeight || 0;
});

defineExpose({
  elementHeight,
});
</script>

<template>
  <div ref="bannerElement" class="banner-level2" :style="rootStyle">
    <img :src="props.backgroundImage ? props.backgroundImage : ''" class="banner-bg" />
    <div class="banner-wrap">
      <div class="banner-text" :class="illustration ? 'illustration-exit' : ''">
        <p v-if="backgroundText" class="banner-text-bg">
          {{ backgroundText }}
        </p>
        <h1 v-if="title" class="banner-title">{{ title }}</h1>
        <p v-if="subtitle" class="banner-subtitle">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.operate" class="banner-operate">
        <slot name="operate"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-level2 {
  position: relative;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--o-color-primary1);
  overflow: hidden;
}
@include in-dark {
  .banner-bg {
    @include img-in-dark;
  }
}
.banner-bg {
  position: absolute;
  height: 100%;
  width: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}
.banner-wrap {
  position: relative;
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-content-padding);
  display: flex;
  justify-content: space-between;
  height: 160px;
  .banner-text {
    display: flex;
    flex-direction: column;
    position: relative;
    margin-top: auto;
    margin-bottom: auto;
    position: relative;
    z-index: 3;
    &.illustration-exit {
      max-width: 54%;
    }
    .banner-text-bg {
      position: absolute;
      top: 0;
      color: var(--o-color-info1);
      opacity: 0.14;
      @include display1;
      font-weight: bold;
      user-select: none;
      pointer-events: none;
    }
    .banner-title {
      position: relative;
      z-index: 1;
      width: 100%;
      color: #fff;
      @include h1;
      font-weight: 500;
      margin: 0;
      --d: 40px;
    }
    .banner-subtitle {
      position: relative;
      z-index: 1;
      color: rgba($color: #fff, $alpha: 0.8);
      @include text1;
      margin-top: 8px;
      --d: 60px;
    }
    .banner-operation {
      margin-top: 24px;
      --d: 100px;
      @include respond-to('phone') {
        margin-top: 12px;
      }
    }
  }
  .banner-illustration {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 44px;
    object-fit: fill;

    @include respond-to('<=pad') {
      right: 24px;
    }

    @include respond-to('phone') {
      right: 24px;
    }

    img {
      user-select: none;
      max-height: 189px;
      pointer-events: none;

      @include respond-to('<=pad') {
        max-height: 160px;
      }

      @include respond-to('phone') {
        max-height: 94px;
      }
    }
  }
  .banner-operate {
    display: flex;
    align-items: center;
  }
}
@keyframes fade-up {
  from {
    transform: translateY(var(--d));
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-text {
  .banner-title {
    animation: fade-up var(--o-duration-l) var(--o-easing-standard-in);
  }
  .banner-subtitle {
    animation: fade-up 800ms var(--o-easing-standard-in);
  }
}
</style>
