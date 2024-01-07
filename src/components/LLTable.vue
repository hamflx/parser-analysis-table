<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { TypingProduction } from '../types/production'

const productionList = ref<TypingProduction[]>([])

const onButtonAdd = () => {
  productionList.value.push({ left: '', right: '' })
}

watchEffect(() => {

})
</script>

<template>
  <button @click="onButtonAdd">Add</button>
  <div class="production__list">
    <template v-for="pro of productionList">
      <div class="production__list__item">
        <input v-model="pro.left"/>
        →
        <input v-model="pro.right"/>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.production__list {
  &__item {
    display: flex;
  }
}
</style>
