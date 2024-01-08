<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { parseProduction, transformLeftRecurse } from './analysis'
import type { Production, TypingProduction } from '../types/production'

const productionList = ref<TypingProduction[]>([])
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])

const onButtonAdd = () => {
  productionList.value.push({ left: '', right: '' })
}

watchEffect(() => {
  parsedProductionList.value = parseProduction(productionList.value)
  rightRecurseProductionList.value = transformLeftRecurse(parsedProductionList.value)
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

  <div>parsed</div>
  <div class="production__list">
    <template v-for="pro of parsedProductionList">
      <div class="production__list__item">
        <div class="production__list__item__left">
          {{ pro.left.symbol }}
        </div>
        →
        <div class="production__list__item__right">
          <template v-for="item of pro.right">
            <div class="production__list__item__right__item">
              <template v-for="sym of item.content">
                <span class="production__list__item__right__item__symbol">
                  {{ sym.symbol }}
                </span>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>

  <div>Right Recurse</div>
  <div class="production__list">
    <template v-for="pro of rightRecurseProductionList">
      <div class="production__list__item">
        <div class="production__list__item__left">
          {{ pro.left.symbol }}
        </div>
        →
        <div class="production__list__item__right">
          <template v-for="item of pro.right">
            <div class="production__list__item__right__item">
              <template v-for="sym of item.content">
                <span class="production__list__item__right__item__symbol">
                  {{ sym.symbol }}
                </span>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.production__list {
  &__item {
    display: flex;

    &__right {
      &__item {
        &__symbol {
          padding: 0 4px;
          background-color: #eee;
          border-radius: 4px;

          & + & {
            margin-left: 12px;
          }
        }
      }
    }
  }
}
</style>
