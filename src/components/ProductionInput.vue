<script setup lang="ts">
import { TypingProduction } from '../types/production';

const productionList= defineModel<TypingProduction[]>({ required: true })

const onButtonAdd = () => {
  productionList.value.push({ left: '', right: '' })
}

const onRemoveProduction = (index: number) => {
  productionList.value.splice(index, 1)
}
</script>

<template>
  <div class="production__input">
    <button @click="onButtonAdd">Add</button>
    <div class="production__list">
      <template v-for="(pro, index) of productionList">
        <div class="production__list__item">
          <input v-model="pro.left"/>
          →
          <input v-model="pro.right"/>
          <button @click="onRemoveProduction(index)">x</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
