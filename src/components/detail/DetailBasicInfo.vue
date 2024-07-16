<script lang="ts" setup>
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { OLink, OIcon } from '@opensig/opendesign';
import type { DetailItemT } from '@/@types/app';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';

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

// 超出140字符就显示更多
const descNum = 150;
const isToggle = ref(false);
const descSummary = (v: string) => {
  return isToggle.value ? v : v.slice(0, descNum);
};

const showMore = () => {
  isToggle.value = !isToggle.value;
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
        <!-- 详细描述超出显示展开收起 -->
        <template v-else-if="item.name === t('detail.description') && item.value.length > descNum">
          <span class="desc">{{ descSummary(item.value) }}</span>
          <div class="view-all">
            <OLink color="primary" :class="isToggle ? 'up' : 'down'" @click="showMore" size="small">
              {{ isToggle ? '收起' : '展开' }}
              <template #suffix>
                <OIcon><IconChevronDown /></OIcon>
              </template>
            </OLink>
          </div>
        </template>
        <template v-else> {{ item.value }}</template>
      </div>
    </div>
  </div>
  <ExternalLink v-if="showExternalDlg" :href="externalLink" @change="showExternalDlg = false" />
</template>

<style lang="scss" scoped>
@import '@/assets/style/category/detail/index.scss';

.view-all {
  margin-top: 8px;
  .o-link-small {
    @include tip1;
  }
  svg {
    color: var(--o-color-primary1);
    transition: 0.3s ease-in-out;
    width: 20px;
    height: 20px;
  }
  .up svg {
    transform: rotate(180deg);
  }
}
</style>
