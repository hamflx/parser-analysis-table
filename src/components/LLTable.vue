<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { grammar, replacements } from './grammar';
import { parseProduction, eliminateLeftRecurse, createNullableFirstFollowTable, generateCode, extractCommonPrefix } from './analysis'
import { type Production, type TypingProduction, type NullableFirstFollowTable, ReplacementItem } from '../types/production'
import ProductionView from './ProductionView.vue';
import ProductionSymbol from './ProductionSymbol.vue';
import ProductionInput from './ProductionInput.vue';
import ReplacementList from './ReplacementList.vue';

const productionList = ref<TypingProduction[]>(grammar)
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])
const nullableFirstFollowTable = ref<NullableFirstFollowTable>({ rows: [] })
const replacementList = ref<ReplacementItem[]>(replacements)
const generatedCode = ref('')

watchEffect(() => {
  try {
    parsedProductionList.value = parseProduction(productionList.value)
    rightRecurseProductionList.value = extractCommonPrefix(eliminateLeftRecurse(parsedProductionList.value))
    nullableFirstFollowTable.value = createNullableFirstFollowTable(rightRecurseProductionList.value)
    generatedCode.value = generateCode(rightRecurseProductionList.value, nullableFirstFollowTable.value, replacementList.value)
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div class="row">
    <div class="col">
      <section>
        <h2>Grammar</h2>
        <ProductionInput v-model="productionList"></ProductionInput>
      </section>
    </div>
    <div class="col">
      <section>
        <h2>Token Replacements</h2>
        <ReplacementList v-model="replacementList"></ReplacementList>
      </section>
    </div>
  </div>
  
  <div class="row">
    <div class="col">
      <section>
        <h2>parsed</h2>
        <ProductionView :production-list="parsedProductionList"/>
      </section>
    </div>
    <div class="col">
      <section>
        <h2>Right Recurse</h2>
        <ProductionView :production-list="rightRecurseProductionList"/>
      </section>
    </div>
  </div>

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

  <section>
    <h2>Code Generate</h2>
    <textarea :value="generatedCode">
    </textarea>
    <pre class="emit-code">{{ generatedCode }}</pre>
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

.row {
  display: flex;

  .col {
    flex: 1 1 0;
    width: 0;
  }
}

.emit-code {
  overflow: auto;
}
</style>
