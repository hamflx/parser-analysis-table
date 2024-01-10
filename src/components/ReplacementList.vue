<script setup lang="ts">
import { ReplacementItem } from '../types/production';

const replacementList = defineModel<ReplacementItem[]>({ required: true })

const onButtonAdd = (index: number) => {
  replacementList.value.splice(index + 1, 0, { find: '', replace: '' })
}
</script>

<template>
  <button @click="onButtonAdd(-1)">Add</button>
  <div class="replacement-list">
    <template v-for="(item, index) of replacementList">
      <div class="replacement-list__item">
        <input v-model="item.find"/>
        →
        <input v-model="item.replace"/>
        <button @click="onButtonAdd(index)">+</button>
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
