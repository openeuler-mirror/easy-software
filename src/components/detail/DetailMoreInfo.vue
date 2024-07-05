<script lang="ts" setup>
import { type PropType } from 'vue';
import { OTab, OTabPane } from '@opensig/opendesign';

import { moreColumns } from '@/data/detail/index';
import type { MoreMessgeT } from '@/@types/app';

defineProps({
  options: {
    type: Array as PropType<Array<MoreMessgeT>>,
    required: true,
  },
});
</script>

<template>
  <OTab variant="text" :line="false" class="domain-tabs" :class="options.length > 1 ? 'tabs-switch' : 'tabs-one'">
    <template v-for="item in options" :key="item">
      <OTabPane class="tab-pane" v-if="item.value.length > 0" :label="item.name">
        <AppTableToggle :columns="moreColumns" :data="item.value" />
      </OTabPane>
    </template>
  </OTab>
</template>

<style lang="scss" scoped></style>
