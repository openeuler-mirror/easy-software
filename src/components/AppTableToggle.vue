<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { OTable, OLink, OIcon } from '@opensig/opendesign';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconHelp from '~icons/app/icon-help1.svg';
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return [];
    },
  },
  columns: {
    type: Object,
    default: () => {
      return [];
    },
  },
});

const { t } = useI18n();

const isToggle = ref(false);
const tableLen = ref(8);
const tableAllData = computed(() => {
  let tableVerData = [];
  if (isToggle.value && props.data.length > tableLen.value) {
    tableVerData = props.data;
  } else {
    tableVerData = props.data.slice(0, tableLen.value);
  }
  return tableVerData;
});
const showMore = () => {
  isToggle.value = !isToggle.value;
};
</script>

<template>
  <OTable :columns="columns" :data="tableAllData" border="all" :small="true" :class="tableAllData.length > 10 ? 'max' : 'min'">
    <template #th_flags>
      <span class="flags">
        Flags
        <a title="aaa"
          ><OIcon style="margin-left: 8px"><IconHelp /></OIcon
        ></a>
      </span> </template
  ></OTable>
  <p v-if="tableAllData.length >= tableLen" @click="showMore" class="view-all">
    <OLink color="primary" :class="isToggle ? 'up' : 'down'" size="small">
      {{ isToggle ? t('software.upList') : t('software.viewAll') }}
      <template #suffix>
        <OIcon><IconChevronDown /></OIcon>
      </template>
    </OLink>
  </p>
</template>

<style lang="scss" scoped>
.view-all {
  text-align: center;
  margin-top: 12px;
  .o-link-small {
    @include tip2;
  }
  svg {
    color: var(--o-color-primary1);
    transition: 0.3s ease-in-out;
  }
  .up svg {
    transform: rotate(180deg);
  }
}
.flags {
  display: flex;
  align-items: center;
}
</style>
