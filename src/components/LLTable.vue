<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { parseProduction, transformLeftRecurse, createNullableFirstFollowTable, generateCode } from './analysis'
import { type Production, type TypingProduction, type NullableFirstFollowTable, ReplacementItem } from '../types/production'
import ProductionView from './ProductionView.vue';
import ProductionSymbol from './ProductionSymbol.vue';
import ProductionInput from './ProductionInput.vue';
import ReplacementList from './ReplacementList.vue';

const productionList = ref<TypingProduction[]>([{"left":"P","right":"E $"},{"left":"E","right":"E < B"},{"left":"E","right":"E > B"},{"left":"E","right":"B"},{"left":"B","right":"B + T"},{"left":"B","right":"B - T"},{"left":"B","right":"T"},{"left":"T","right":"T * F"},{"left":"T","right":"T / F"},{"left":"T","right":"F"},{"left":"F","right":"N"},{"left":"F","right":"- N"},{"left":"N","right":"id I"},{"left":"N","right":"num"},{"left":"N","right":"( E )"},{"left":"N","right":"if E { E } else { E }"},{"left":"I","right":""},{"left":"I","right":"( L )"},{"left":"L","right":""},{"left":"L","right":"M"},{"left":"M","right":"M , E"},{"left":"M","right":"E"}])
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])
const nullableFirstFollowTable = ref<NullableFirstFollowTable>({ rows: [] })
const replacementList = ref<ReplacementItem[]>([
  {find: 'id', replace: 'Token::Id(_)'},
  {find: 'num', replace: 'Token::Num(_)'},
  {find: 'if', replace: 'Token::If'},
  {find: 'else', replace: 'Token::Else'},
  {find: '(', replace: 'Token::LParen'},
  {find: ')', replace: 'Token::RParen'},
  {find: '<', replace: 'Token::LessThan'},
  {find: '>', replace: 'Token::GreaterThan'},
  {find: '+', replace: 'Token::Plus'},
  {find: '-', replace: 'Token::Minus'},
  {find: '*', replace: 'Token::Mul'},
  {find: '/', replace: 'Token::Div'},
  {find: '$', replace: 'Token::Eof'},
  {find: '{', replace: 'Token::LBrace'},
  {find: '}', replace: 'Token::RBrace'},
  {find: ',', replace: 'Token::Comma'},
])
const generatedCode = ref('')

watchEffect(() => {
  try {
    parsedProductionList.value = parseProduction(productionList.value)
    rightRecurseProductionList.value = transformLeftRecurse(parsedProductionList.value)
    nullableFirstFollowTable.value = createNullableFirstFollowTable(rightRecurseProductionList.value)
    generatedCode.value = generateCode(rightRecurseProductionList.value, nullableFirstFollowTable.value, replacementList.value)
  } catch (e) {
    console.error(e)
  }
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

  <section>
    <h2>Token Replacements</h2>
    <ReplacementList v-model="replacementList"></ReplacementList>
  </section>

  <section>
    <h2>Code Generate</h2>
    <textarea :value="generatedCode">
    </textarea>
    <pre>{{ generatedCode }}</pre>
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
