<script setup lang="ts">
defineProps<{ symbol: string }>()
</script>

<template>
  <span class="production__symbol">{{ symbol }}</span>
</template>

<style scoped lang="scss">
.production {
  &__symbol {
    padding: 0 8px;
    background-color: #eee;
    border-radius: 4px;

    & + & {
      margin-left: 12px;
    }
  }
}
</style>
