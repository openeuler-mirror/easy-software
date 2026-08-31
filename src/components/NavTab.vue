<script setup lang="ts">
import { toRefs, ref, watchEffect } from 'vue';
import { OTab, OTabPane } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const { modelValue } = toRefs(props);

const router = useRouter();
const selected = ref();
const { t } = useI18n();

watchEffect(() => {
  selected.value = modelValue?.value;
});

// tab选项
const selectedOptions = [
  {
    value: 'rpm',
    label: t('software.rpmpkg'),
    path: '/zh/rpm',
  },
  {
    value: 'image',
    label: t('software.image'),
    path: '/zh/image',
  },
  {
    value: 'oepkg',
    label: t('software.oepkg'),
    path: '/zh/oepkg',
  },
  {
    value: 'conda',
    label: t('software.conda'),
    path: '/zh/conda',
  },
  {
    value: 'pypi',
    label: t('software.pypi'),
    path: '/zh/pypi',
  },
  {
    value: 'npm',
    label: t('software.npm'),
    path: '/zh/npm',
  },
  {
    value: 'source',
    label: t('software.source'),
    path: '/zh/source',
  },
];

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// tab切换
const changeTabs = (value: string) => {
  const findone = selectedOptions?.find((item) => item.value === value);
  if (findone?.path) {
    emits('update:modelValue', value);
    router.push({
      path: findone?.path,
    });
  }
};
</script>

<template>
  <OTab v-model="selected" variant="text" :line="false" @change="changeTabs">
    <template v-for="item in selectedOptions" :key="item.value">
      <OTabPane :value="item.value" :label="item.label"></OTabPane>
    </template>
  </OTab>
</template>

<style lang="scss" scoped>
.o-tab {
  --tab-nav-justify: left;
  --tab-icon-color: rgba(255, 255, 255, 0.8);
  --tab-nav-color-active: var(--o-color-white);
  --tab-nav-color-hover: var(--o-color-white);
  --tab-nav-anchor-color: var(--o-color-white);
  --tab-nav-gap: 40px;
  .o-tab-nav {
    --tab-nav-padding: 0;
  }
}

@include respond-to(phone) {
  .nav-tab {
    background-color: var(--o-color-fill1);
  }

  :deep(.o-tab-nav) {
    @include text2;
    --tab-nav-padding: 4px 0;
  }
}
</style>
