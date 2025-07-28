<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { ElSlider } from 'element-plus';
import { computed, ref, type CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    showDesc?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  {
    min: 0,
    max: 10,
    step: 1,
  }
);
const emits = defineEmits<{
  (event: 'update:modelValue', arg: number): void;
  (event: 'change', arg: number): void;
}>();

const showTip = ref(false);
const score = useVModel(props, 'modelValue', emits);

const tooltipOffset = computed(() => {
  return `${Math.floor((score.value * 100) / props.max)}%`;
});

const changeSlider = () => {
  showTip.value = true;
};

interface Mark {
  style: CSSProperties;
  label: string;
}

type Marks = Record<number, Mark | string>;
const marks = computed(() => {
  const temp: Marks = {};
  for (let i = 0; i <= props.max; i += props.step) {
    temp[i] = '';
  }
  return temp;
});

const onChange = (val: number | number[]) => emits('change', val as number);
</script>

<template>
  <div class="slider">
    <div class="slider-body">
      <div class="slider-tip">
        <div v-show="showTip" class="slide-btn-tip">
          {{ score }}
        </div>
      </div>
      <el-slider :min="min" :max="max" :step="step" show-stops v-model="score" :marks="marks" :show-tooltip="false" @input="changeSlider" @change="onChange" />
    </div>

    <div v-if="showDesc" class="grade-info">
      <span>0-不满意</span>
      <span>10-非常满意</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.slider {
  --el-slider-button-wrapper-offset: -14px;
  width: 300px;
  .slider-body {
    padding-top: 30px;
    .slider-tip {
      position: relative;

      .slide-btn-tip {
        width: 28px;
        height: 20px;
        text-align: center;
        font-size: var(--o-font_size-tip1);
        color: var(--o-color-info1);
        background-color: var(--o-color-fill2);
        border-radius: var(--o-radius-xs);
        box-shadow: 0 3px 8px rgba(18, 20, 23, 0.08);
        backdrop-filter: blur(5px);
        border: 1px solid var(--o-color-control4-light);
        position: absolute;
        top: -32px;
        transform: translateX(-50%);
        left: v-bind(tooltipOffset);
        line-height: 1.15;

        .tip-num {
          transform: translateY(-3px);
        }

        &::after {
          content: '';
          display: block;
          width: 8px;
          height: 8px;
          transform: rotateZ(45deg);
          border: 1px solid #000;
          border-color: transparent var(--o-color-control4-light) var(--o-color-control4-light) transparent;
          background-color: var(--o-color-fill2);
          position: absolute;
          bottom: -4px;
          right: 9px;
        }
      }
    }

    :deep(.el-slider) {
      height: auto;
      height: 10px;

      .el-slider__runway {
        height: 8px;
        border-radius: var(--o-radius-xs);
        background-color: var(--o-color-control1-light);
      }

      .el-slider__bar {
        height: 10px;
        background-image: linear-gradient(270deg, #002fa7 0%, #21a9fc 100%);
        top: -1px;
        border-radius: 5px;
      }

      .el-slider__button-wrapper + div {
        position: relative;
        transform: translateY(2px);
        z-index: 2;

        & + div {
          transform: translateY(2px);
          & > .el-slider__stop:nth-of-type(1) {
            transform: translatex(2px);
          }
        }
      }

      .el-slider__stop {
        width: 2px;
        height: 2px;
        background-color: var(--o-color-control2);
        top: 1px;
      }

      .el-slider__marks-stop {
        background-color: var(--o-color-fill2);

        &:nth-last-of-type(1) {
          transform: translateX(-4px);
          background-color: var(--o-color-control2);
        }
      }

      .el-slider__button {
        position: relative;
        border: none;
        box-shadow: var(--o-shadow-2);

        &::after {
          display: block;
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--o-color-primary1);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }

  .grade-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: var(--o-font_size-tip2);
    color: var(--o-color-info3);
    margin-top: 14px;
  }
}
</style>
