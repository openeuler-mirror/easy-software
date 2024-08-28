<script lang="ts" setup>
import { computed } from 'vue';
import { OPopover } from '@opensig/opendesign';
const props = defineProps({
  content: {
    type: String,
    default: () => {
      return '';
    },
  },
  line: {
    type: Number,
    default: () => {
      return 2;
    },
  },
});

const contentLen = computed(() => props.content.length > props.line * 11);
</script>

<template>
  <OPopover v-if="contentLen" position="top" trigger="hover">
    <template #target>
      <div class="line-clamp">{{ content }}</div>
    </template>
    <div class="box">
      {{ content }}
    </div>
  </OPopover>
  <template v-else>{{ content }} </template>
</template>

<style lang="scss" scoped>
.box {
  max-width: 184px;
  max-height: 154px;
  color: var(--o-color-info1);
  overflow: hidden auto;
  @include scrollbar;
  @include tip1;
}
.line-clamp {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: v-bind(line);
  -webkit-box-orient: vertical;
  position: relative;
  word-break: break-all;
}
</style>
