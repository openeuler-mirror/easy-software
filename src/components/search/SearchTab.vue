<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { OTab, OTabPane } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useLocale } from '@/composables/useLocale';

interface MenuT {
  key: string;
  docCount: number;
}

const props = defineProps({
  menu: {
    type: Array as PropType<MenuT[]>,
    default: () => [],
  },
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { locale } = useLocale();

const searchKey = ref('');
const tabName = ref('');
const fliterSelected = ref('');
const searchCategoryValue = ref(props.menu[0]?.key || 'all');
const onChangeTabs = (v: string) => {
  if (v === '') {
    return;
  }

  tabName.value = v;

  fliterSelected.value = route.query.key as string;
  router.push({
    path: `/${locale.value}/search`,
    query: {
      name: searchKey.value,
      tab: tabName.value,
      key: fliterSelected.value,
    },
  });
};

onMounted(() => {
  searchKey.value = route.query.name as string;
  tabName.value = route.query?.tab as string;
  fliterSelected.value = route.query.key as string;
});

watch(
  () => props.menu,
  () => {
    props.menu.forEach((item) => {
      if (item.key === tabName.value) {
        searchCategoryValue.value = item.key;
      }
    });
  }
);

watch(
  () => route.query.name as string,
  (v: string) => {
    searchKey.value = v;
  }
);
</script>

<template>
  <OTab v-model="searchCategoryValue" :line="false" variant="text" :style="{ '--tab-nav-justify': 'left' }" @change="(v) => onChangeTabs(v)">
    <OTabPane v-for="item in menu" :key="item.key" class="pane" :value="item.key" :label="t(`software.${item.key}`) + `（${item.docCount}）`"> </OTabPane>
  </OTab>
</template>

<style lang="scss" scoped></style>
