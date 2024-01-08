<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { parseProduction, transformLeftRecurse, createNullableFirstFollowTable } from './analysis'
import type { Production, TypingProduction, NullableFirstFollowTable } from '../types/production'
import ProductionView from './ProductionView.vue';
import ProductionSymbol from './ProductionSymbol.vue';
import ProductionInput from './ProductionInput.vue';

const productionList = ref<TypingProduction[]>([{"left":"S","right":"E $"},{"left":"E","right":"E < B"},{"left":"E","right":"E > B"},{"left":"E","right":"B"},{"left":"B","right":"B + T"},{"left":"B","right":"B - T"},{"left":"B","right":"T"},{"left":"T","right":"T * F"},{"left":"T","right":"T / F"},{"left":"T","right":"F"},{"left":"F","right":"N"},{"left":"F","right":"- N"},{"left":"N","right":"id"},{"left":"N","right":"num"},{"left":"N","right":"( E )"},{"left":"N","right":"if E { E } else { E }"}])
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])
const nullableFirstFollowTable = ref<NullableFirstFollowTable>({ rows: [] })

watchEffect(() => {
  parsedProductionList.value = parseProduction(productionList.value)
  rightRecurseProductionList.value = transformLeftRecurse(parsedProductionList.value)
  nullableFirstFollowTable.value = createNullableFirstFollowTable(rightRecurseProductionList.value)
})
</script>

<template>
  <section>
    <h2>Grammar</h2>
    <ProductionInput v-model="productionList"></ProductionInput>
  </section>

  <section>
    <h2>parsed</h2>
    <ProductionView :production-list="parsedProductionList"/>
  </section>

  <section>
    <h2>Right Recurse</h2>
    <ProductionView :production-list="rightRecurseProductionList"/>
  </section>

  <section>
    <h2>Nullable、FIRST、FOLLOW</h2>
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
                <ProductionSymbol :symbol="sym"></ProductionSymbol>
              </template>
            </td>
            <td>
              <template v-for="sym of row.follow">
                <ProductionSymbol :symbol="sym"></ProductionSymbol>
              </template>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </section>
</template>

<style scoped lang="scss">
section {
  margin: 12px;
}

table {
  th {
    text-align: left;
  }

  th,
  td {
    padding: 0 20px 0 0;
  }
}
</style>
