<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { OTab, OTabPane } from '@opensig/opendesign';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useLocale } from '@/composables/useLocale';
import { useSearchStore } from '@/stores/search';

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
const searchStore = useSearchStore();

const searchKey = ref('');
const tabName = ref('');
const fliterSelected = ref('');
const searchCategoryValue = ref(props.menu[0]?.key || 'all');

let nameOrderInfo: MenuT = {
  key: '',
  docCount: -1,
};

const onChangeTabs = (v: string) => {
  if (v === '') {
    return;
  }

  tabName.value = v;
  // 清除状态
  searchStore.changeNameOrderState(false);
  searchStore.changeNameOrderCount(0);
  nameOrderInfo.docCount = -1;
  nameOrderInfo.key = '';

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

// 搜索数量>=10000 显示10000+
const DOCCOUNT = 10000;
const searchDocCount = (v: number) => {
  return v >= DOCCOUNT ? `${v}+` : v;
};

// 处理搜索后点击按首字母排序Count参数问题
const getNameOrder = () => {
  props.menu.forEach((item) => {
    if (searchStore.nameOrder) {
      if (item.key === tabName.value) {
        if (nameOrderInfo.docCount === -1) {
          nameOrderInfo = JSON.parse(JSON.stringify(item));
        }
        item.docCount = searchStore.count;
      }
    } else {
      if (item.key === tabName.value && tabName.value === nameOrderInfo.key) {
        item.docCount = nameOrderInfo.docCount;
      }
    }
  });
};

watch(
  () => [searchStore.count, searchStore.nameOrder],
  () => {
    getNameOrder();
  }
);
</script>

<template>
  <OTab v-model="searchCategoryValue" :line="false" variant="text" :style="{ '--tab-nav-justify': 'left' }" @change="(v) => onChangeTabs(v)">
    <template v-for="item in menu" :key="item.key">
      <OTabPane v-if="item.key !== 'appversion'" class="pane" :value="item.key" :label="t(`software.${item.key}`) + `（${searchDocCount(item.docCount)}）`">
      </OTabPane>
    </template>
  </OTab>
</template>

<style lang="scss" scoped></style>
