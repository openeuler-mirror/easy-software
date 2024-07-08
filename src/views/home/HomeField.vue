<script lang="ts" setup>
import { type PropType } from 'vue';
import { OLink, ORow, OCol, OIcon } from '@opensig/opendesign';
import type { AppT } from '@/@types/app';
import { useRouter } from 'vue-router';
import { useLocale } from '@/composables/useLocale';

import IconChevronDown from '~icons/app/icon-chevron-right.svg';

defineProps({
  data: {
    type: Array as PropType<AppT[]>,
    required: true,
    default: () => [],
  },
});

const router = useRouter();
const { locale } = useLocale();
const jumpTo = (name: string) => {
  router.push({
    path: `/${locale.value}/field`,
    query: {
      type: name,
    },
  });
};
</script>

<template>
  <div v-if="data.length > 0" class="pkg-main">
    <div v-for="item in data" :key="item.name" class="domain-item">
      <template v-if="item.children?.length > 0">
        <div class="domain-item-title">
          <h3 :id="item.name">{{ item.name }}</h3>
          <OLink v-if="item.children?.length > 4" @click="jumpTo(item.name)">
            了解更多
            <template #suffix>
              <OIcon><IconChevronDown /></OIcon>
            </template>
          </OLink>
        </div>
        <ORow gap="32px" flex-wrap="wrap">
          <OCol v-for="subItem in item.children.slice(0, 4)" :key="subItem.name" flex="0 1 25%">
            <OCardItem :data="subItem" />
          </OCol>
        </ORow>
      </template>
    </div>
  </div>
  <div v-else class="pkg-main">
    <HomeSkeleton />
  </div>
</template>

<style lang="scss" scoped>
.domain-item {
  margin: 0 0 40px;
  h3 {
    @include h2;
    text-align: center;
    font-weight: 500;
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
}
</style>
