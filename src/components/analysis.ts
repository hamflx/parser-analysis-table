import { NullableFirstFollowTable, NullableFirstFollowTableRow, Production, ProductionRight, ProductionSymbol, SymbolType, TypingProduction } from "../types/production";

const parseProductionRight = (right: string, nonTerminalSymbols: string[]): ProductionRight => {
  const symbols = right.split(/\s+/)
  const content = symbols.filter(s => s).map(s => {
    return {
      symbol: s,
      type: nonTerminalSymbols.includes(s) ? SymbolType.NonTerminal : SymbolType.Terminal
    } satisfies ProductionSymbol
  })
  return {content}
}

const equalProductionRight = (a: ProductionRight, b: ProductionRight): boolean => {
  return a.content.length === b.content.length && a.content.every((itemA, i) => b.content[i].symbol === itemA.symbol && b.content[i].type === itemA.type)
}

const isLeftRecurse = (production: Production): boolean => {
  const {left, right} = production
  return right.some(r => {
    const startSymbol = r.content[0]
    return startSymbol && startSymbol.symbol === left.symbol && startSymbol.type === left.type
  })
}

export const transformLeftRecurse = (productionList: Production[]): Production[] => {
  const transformed: Production[] = []
  for (const production of productionList) {
    if (!isLeftRecurse(production)) {
      transformed.push(production)
      continue
    }
    const {left, right} = production
    const newProduction: Production = {
      left,
      right: []
    }
    const symbol_ = {
      type: SymbolType.NonTerminal,
      symbol: left.symbol + '_'
    }
    const newProduction_: Production = {
      left: symbol_,
      right: []
    }
    for (const rightItem of right) {
      const startSymbol = rightItem.content[0]
      if (!startSymbol) {
        console.error('unsupported empty production')
        continue
      }
      if (startSymbol.type === left.type && startSymbol.symbol === left.symbol) {
        newProduction_.right.push({
          content: [
            ...rightItem.content.slice(1),
            symbol_
          ]
        })
      } else {
        newProduction.right.push({
          content: [
            ...rightItem.content,
            symbol_
          ]
        })
      }
    }
    newProduction_.right.push({
      content: []
    })
    transformed.push(newProduction)
    transformed.push(newProduction_)
  }
  return transformed
}

export const parseProduction = (input: TypingProduction[]): Production[] => {
  const productionList: Production[] = []
  const nonTerminalSymbols = input.map(i => i.left.trim())
  for (let {left, right} of input) {
    left = left.trim()
    right = right.trim()
    if (!left) continue
    const existsProduction = productionList.find(p => p.left.symbol === left)
    const productionRight: ProductionRight = parseProductionRight(right, nonTerminalSymbols)
    if (existsProduction) {
      const existsProductionRight = existsProduction.right.find(r => equalProductionRight(r, productionRight))
      if (!existsProductionRight) {
        existsProduction.right.push(productionRight)
      }
    } else {
      productionList.push({
        left: {
          type: SymbolType.NonTerminal,
          symbol: left
        },
        right: [productionRight]
      })
    }
  }
  return productionList
}

export const createNullableFirstFollowTable = (productionList: Production[]): NullableFirstFollowTable => {
  const rows: NullableFirstFollowTableRow[] = productionList.map(p => {
    return {
      nonTerminalSymbol: p.left.symbol,
      nullable: false,
      first: [],
      follow: []
    } satisfies NullableFirstFollowTableRow
  })
  let changed = true
  while (changed) {
    for (const {left, right} of productionList) {
      for (const {content: items} of right) {
        const isNullable = !items.length
        const row = rows.find(r => r.nonTerminalSymbol === left.symbol)!
        const prevIsNullable = row.nullable
        if (isNullable !== prevIsNullable) {
          row.nullable = isNullable
          changed = true
        }
      }
    }
    changed = false
  }
  return {rows}
}
