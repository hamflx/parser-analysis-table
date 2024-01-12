<script setup lang="ts">
import { TypingProduction } from '../types/production';

const productionList= defineModel<TypingProduction[]>({ required: true })

const onButtonAdd = (index: number) => {
  productionList.value.splice(index + 1, 0, { left: '', right: '', emits: '' })
}

const onRemoveProduction = (index: number) => {
  productionList.value.splice(index, 1)
}
</script>

<template>
  <div class="production__input">
    <button @click="onButtonAdd(-1)">Add</button>
    <div class="production__list">
      <template v-for="(pro, index) of productionList">
        <div class="production__list__item">
          <input v-model="pro.left"/>
          →
          <input v-model="pro.right"/>
          →
          <input v-model="pro.emits"/>
          <button @click="onRemoveProduction(index)">x</button>
          <button @click="onButtonAdd(index)">+</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
