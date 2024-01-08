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

const isSymbolNullable = (right: ProductionRight, table: NullableFirstFollowTable) => {
  return !right.content.length || right.content.every(sym => {
    return sym.type === SymbolType.NonTerminal &&
      table.rows.find(r => r.nonTerminalSymbol === sym.symbol)!.nullable
  })
}

const getSymbolFirstSet = (right: ProductionRight, table: NullableFirstFollowTable) => {
  const firstSet: string[] = []
  for (const {symbol, type} of right.content) {
    if (type === SymbolType.Terminal) {
      firstSet.push(symbol)
      break
    }
    const row = table.rows.find(r => r.nonTerminalSymbol === symbol)!
    firstSet.push(...row.first)
    if (!row.nullable) {
      break
    }
  }
  return firstSet
}

export const createNullableFirstFollowTable = (productionList: Production[]): NullableFirstFollowTable => {
  const rows: NullableFirstFollowTableRow[] = productionList.map(p => {
    return {
      nonTerminalSymbol: p.left.symbol,
      nullable: false,
      first: new Set(),
      follow: new Set()
    } satisfies NullableFirstFollowTableRow
  })
  const table = {rows}
  let nullableChanged = true
  while (nullableChanged) {
    nullableChanged = false
    for (const {left, right} of productionList) {
      const row = rows.find(r => r.nonTerminalSymbol === left.symbol)!
      const isNullable = right.some(r => isSymbolNullable(r, table))
      const prevIsNullable = row.nullable
      if (isNullable !== prevIsNullable) {
        row.nullable = isNullable
        nullableChanged = true
      }
    }
  }
  let firstSetChanged = true
  while (firstSetChanged) {
    firstSetChanged = false
    for (const {left, right} of productionList) {
      const row = table.rows.find(r => r.nonTerminalSymbol === left.symbol)!
      const len = row.first.size
      right.map(r => getSymbolFirstSet(r, table)).flat().forEach(s => row.first.add(s))
      if (len !== row.first.size) {
        firstSetChanged = true
      }
    }
  }
  return table
}
