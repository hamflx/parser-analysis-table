<script setup lang="ts">
import ProductionSymbol from './ProductionSymbol.vue';
import type { Production } from '../types/production';

defineProps<{ productionList: Production[] }>()
</script>

<template>
  <div class="production__list">
    <div class="production__list__content">
      <table class="production__list__table">
        <template v-for="pro of productionList">
          <tr class="production__list__item">
            <td class="production__list__item__left">
              <div class="production__list__item__cell">
                <ProductionSymbol :symbol="pro.left.symbol"></ProductionSymbol>
              </div>
            </td>
            <td class="production__list__item__arrow">
              <div class="production__list__item__cell">→</div>
            </td>
            <td class="production__list__item__right">
              <div class="production__list__item__cell">
                <template v-for="item of pro.right">
                  <div class="production__list__item__right__item">
                    <ProductionSymbol v-if="!item.content.length" symbol="ɛ"></ProductionSymbol>
                    <template v-for="sym of item.content">
                      <ProductionSymbol :symbol="sym.symbol"></ProductionSymbol>
                    </template>
                  </div>
                </template>
              </div>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.production__list {
  display: flow-root;

  &__content {
    margin: -8px 0;
  }

  td {
    vertical-align: top;
  }

  &__item {
    &__cell {
      padding: 8px 0;
    }

    &__arrow {
      margin: 0 12px;
    }

    &__right {
      &__item {
        margin: 4px 0;

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
