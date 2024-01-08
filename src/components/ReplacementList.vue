<script setup lang="ts">
import { ReplacementItem } from '../types/production';

const replacementList = defineModel<ReplacementItem[]>({ required: true })
</script>

<template>
  <div class="replacement-list">
    <template v-for="item of replacementList">
      <div class="replacement-list__item">
        <input v-model="item.find"/>
        →
        <input v-model="item.replace"/>
      </div>
    </template>
  </div>
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
