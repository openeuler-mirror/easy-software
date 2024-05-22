<template>
  <span class="sp">{{ data }}</span>
</template>
<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return '';
    },
  },
});
</script>
<style scoped lang="scss">
.sp {
  background: #002fa7;
  border-radius: 4px;
  color: #fff;
  padding: 3px 6px;
  margin-left: 8px;
}
</style>
