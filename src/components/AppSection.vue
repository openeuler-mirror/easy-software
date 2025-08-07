<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
  line: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div class="app-section">
    <div v-if="title" class="title-bar" :class="{ line: line }">
      <h3>{{ title }}</h3>
      <slot name="append"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.detail-row-side {
  .title-bar {
    margin-bottom: 24px !important;

    &.line {
      border-bottom: 1px solid var(--o-color-control4);
      padding-bottom: 24px;
    }
  }
}
.app-section {
  padding: 40px;
  background: var(--o-color-fill2);
  + .app-section {
    margin-top: 24px;
  }
  .app-section {
    padding: 0;
    background: transparent;
  }
  @include respond-to('<=laptop') {
    padding: 24px;
  }
  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    h3 {
      font-size: 22px;
      line-height: 30px;
      font-weight: 500;
      color: var(--o-color-info1);
    }
  }
  :deep(.domain-tabs) {
    padding-top: 0;
  }
}
</style>
