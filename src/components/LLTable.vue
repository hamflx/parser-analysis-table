<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { parseProduction, eliminateLeftRecurse, createNullableFirstFollowTable, generateCode } from './analysis'
import { type Production, type TypingProduction, type NullableFirstFollowTable, ReplacementItem } from '../types/production'
import ProductionView from './ProductionView.vue';
import ProductionSymbol from './ProductionSymbol.vue';
import ProductionInput from './ProductionInput.vue';
import ReplacementList from './ReplacementList.vue';

const productionList = ref<TypingProduction[]>([{"emits":"","left":"P","right":"Fs E $"},{"left":"Fs","right":"Fn Fs","emits":""},{"left":"Fs","right":"","emits":""},{"left":"Fn","right":"fn id ( ) { E }","emits":""},{"emits":"op_or($1, $3)","left":"E","right":"E || O"},{"emits":"","left":"E","right":"O"},{"emits":"op_and($1, $3)","left":"O","right":"O && A"},{"emits":"","left":"O","right":"A"},{"emits":"op_lt($1, $3)","left":"A","right":"A < B"},{"emits":"op_gt($1, $3)","left":"A","right":"A > B"},{"emits":"op_ge($1, $3)","left":"A","right":"A >= B"},{"emits":"op_le($1, $3)","left":"A","right":"A <= B"},{"emits":"","left":"A","right":"B"},{"emits":"op_add($1, $3)","left":"B","right":"B + T"},{"emits":"op_sub($1, $3)","left":"B","right":"B - T"},{"emits":"","left":"B","right":"T"},{"emits":"op_mul($1, $3)","left":"T","right":"T * F"},{"emits":"op_div($1, $3)","left":"T","right":"T / F"},{"emits":"","left":"T","right":"F"},{"emits":"","left":"F","right":"N"},{"emits":"op_sub(integer(0), $2)","left":"F","right":"- N"},{"emits":"op_not($2)","left":"F","right":"! N"},{"emits":"","left":"N","right":"id I"},{"emits":"","left":"N","right":"num"},{"emits":"$2","left":"N","right":"( E )"},{"emits":"if_expr($2, $4, $8)","left":"N","right":"if E { E } else { E }"},{"emits":"","left":"I","right":""},{"emits":"$2","left":"I","right":"( L )"},{"emits":"","left":"L","right":""},{"emits":"","left":"L","right":"M"},{"emits":"","left":"M","right":"M , E"},{"emits":"","left":"M","right":"E"}])
const parsedProductionList = ref<Production[]>([])
const rightRecurseProductionList = ref<Production[]>([])
const nullableFirstFollowTable = ref<NullableFirstFollowTable>({ rows: [] })
const replacementList = ref<ReplacementItem[]>([{"find":"fn","replace":"Token::Fn"},{"find":"!","replace":"Token::Not"},{"find":"&&","replace":"Token::And"},{"find":"||","replace":"Token::Or"},{"find":"id","replace":"Token::Id(_)"},{"find":"num","replace":"Token::Num(_)"},{"find":"if","replace":"Token::If"},{"find":"else","replace":"Token::Else"},{"find":"(","replace":"Token::LParen"},{"find":")","replace":"Token::RParen"},{"find":"<","replace":"Token::LessThan"},{"find":">","replace":"Token::GreaterThan"},{"find":"<=","replace":"Token::LessEqual"},{"find":">=","replace":"Token::GreaterEqual"},{"find":"+","replace":"Token::Plus"},{"find":"-","replace":"Token::Minus"},{"find":"*","replace":"Token::Mul"},{"find":"/","replace":"Token::Div"},{"find":"$","replace":"Token::Eof"},{"find":"{","replace":"Token::LBrace"},{"find":"}","replace":"Token::RBrace"},{"find":",","replace":"Token::Comma"}])
const generatedCode = ref('')

watchEffect(() => {
  try {
    parsedProductionList.value = parseProduction(productionList.value)
    rightRecurseProductionList.value = eliminateLeftRecurse(parsedProductionList.value)
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
