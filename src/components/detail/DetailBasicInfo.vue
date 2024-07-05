<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { OLink } from '@opensig/opendesign';
import type { DetailItemT } from '@/@types/app';

defineProps({
  options: {
    type: Array as PropType<Array<DetailItemT>>,
    required: true,
  },
});

const { t } = useI18n();

const showExternalDlg = ref(false);
const externalLink = ref('');
const onExternalDialog = (href: string) => {
  externalLink.value = href;
  showExternalDlg.value = true;
};
</script>

<template>
  <div class="basic-info">
    <div v-for="item in options" :key="item.name" class="basic-info-item">
      <span class="label">{{ item.name }}</span>
      <div class="basic-item-box">
        <template v-if="item.name === t('detail.warehouse') || item.name === t('detail.source')">
          <OLink @click="onExternalDialog(item.value)" color="primary" class="tag-new" target="_blank" rel="noopener noreferrer">{{ item.type }}</OLink>
        </template>
        <template v-else-if="item.name === t('detail.pkgVersion')">
          <span v-if="item.value" class="ver">{{ item.value }}</span>
        </template>
        <template v-else> {{ item.value }}</template>
      </div>
    </div>
  </div>
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';
</style>
