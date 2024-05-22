<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="app-section">
    <div v-if="title" class="title-bar">
      <h3>{{ title }}</h3>
      <slot name="append"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.app-section {
  padding: 40px;
  background: var(--o-color-fill2);
  + .app-section {
    margin-top: 24px;
  }
  @include respond-to('<=laptop') {
    padding: 24px;
  }
  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
      @include h2;
      font-weight: 500;
      color: var(--o-color-info1);
      margin-bottom: 16px;
    }
  }
}
</style>
