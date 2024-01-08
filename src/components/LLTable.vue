<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { parseProduction, transformLeftRecurse, createNullableFirstFollowTable } from './analysis'
import type { Production, TypingProduction, NullableFirstFollowTable } from '../types/production'

const productionList = ref<TypingProduction[]>([{"left":"S","right":"E $"},{"left":"E","right":"E < B"},{"left":"E","right":"E > B"},{"left":"E","right":"B"},{"left":"B","right":"B + T"},{"left":"B","right":"B - T"},{"left":"B","right":"T"},{"left":"T","right":"T * F"},{"left":"T","right":"T / F"},{"left":"T","right":"F"},{"left":"F","right":"N"},{"left":"F","right":"-N"},{"left":"N","right":"id"},{"left":"N","right":"num"},{"left":"N","right":"( E )"},{"left":"N","right":"if E { E } else { E }"}])
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])
const nullableFirstFollowTable = ref<NullableFirstFollowTable>({ rows: [] })

const onButtonAdd = () => {
  productionList.value.push({ left: '', right: '' })
}

watchEffect(() => {
  console.log(productionList.value)
  parsedProductionList.value = parseProduction(productionList.value)
  rightRecurseProductionList.value = transformLeftRecurse(parsedProductionList.value)
  nullableFirstFollowTable.value = createNullableFirstFollowTable(rightRecurseProductionList.value)
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
                <span class="production__symbol">
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
                <span class="production__symbol">
                  {{ sym.symbol }}
                </span>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>

  <div>Nullable、FIRST、FOLLOW</div>
  <div>
    <table>
      <tr>
        <th>symbol</th>
        <th>nullable</th>
        <th>FIRST</th>
        <th>FOLLOW</th>
      </tr>
      <template v-for="row of nullableFirstFollowTable.rows">
        <tr>
          <td>{{ row.nonTerminalSymbol }}</td>
          <td>{{ row.nullable ? '✔' : '' }}</td>
          <td>
            <template v-for="sym of row.first">
              <span class="production__symbol">
                {{ sym }}
              </span>
            </template>
          </td>
          <td>
            <template v-for="sym of row.follow">
              <span class="production__symbol">
                {{ sym }}
              </span>
            </template>
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<style scoped lang="scss">
.production {
  &__symbol {
    padding: 0 4px;
    background-color: #eee;
    border-radius: 4px;

    & + & {
      margin-left: 12px;
    }
  }
}
.production__list {
  &__item {
    display: flex;
  }
}
</style>
