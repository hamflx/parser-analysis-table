import { NullableFirstFollowTable, NullableFirstFollowTableRow, Production, ProductionRight, ProductionSymbol, ReplacementItem, SymbolType, TypingProduction } from "../types/production";

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

const getProductionFirstSet = (right: ProductionRight, table: NullableFirstFollowTable) => {
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

const analyseFollowSet = (left: ProductionSymbol, right: ProductionRight, table: NullableFirstFollowTable) => {
  let changed = false
  const addFollowSet = (row: NullableFirstFollowTableRow, symbols: string[]) => {
    const len = row.follow.size
    symbols.forEach(s => row.follow.add(s))
    return len !== row.follow.size
  }
  for (let i = 0; i < right.content.length; i++) {
    const {symbol, type} = right.content[i]
    const row = table.rows.find(r => r.nonTerminalSymbol === symbol)!
    if (type === SymbolType.Terminal) continue
    for (let j = i + 1; j < right.content.length; j++) {
      const nextSymbol = right.content[j]
      if (nextSymbol.type === SymbolType.Terminal) {
        changed ||= addFollowSet(row, [nextSymbol.symbol])
        break
      } else {
        const nextRow = table.rows.find(r => r.nonTerminalSymbol === nextSymbol.symbol)!
        changed ||= addFollowSet(row, [...nextRow.first])
        if (!nextRow.nullable) {
          break
        }
      }
    }

    const nextSymbols = right.content.slice(i + 1)
    const nextNullable = !nextSymbols.length || nextSymbols.every(s => {
      return s.type === SymbolType.NonTerminal &&
      table.rows.find(r => r.nonTerminalSymbol === s.symbol)!.nullable
    })
    if (nextNullable) {
      const leftRow = table.rows.find(r => r.nonTerminalSymbol === left.symbol)!
      changed ||= addFollowSet(row, [...leftRow.follow])
    }
  }
  return changed
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
        nullableChanged ||= true
      }
    }
  }
  let firstSetChanged = true
  while (firstSetChanged) {
    firstSetChanged = false
    for (const {left, right} of productionList) {
      const row = table.rows.find(r => r.nonTerminalSymbol === left.symbol)!
      const len = row.first.size
      right.map(r => getProductionFirstSet(r, table)).flat().forEach(s => row.first.add(s))
      let changed = len !== row.first.size
      firstSetChanged ||= changed
    }
  }
  let followSetChanged = true
  while (followSetChanged) {
    followSetChanged = false
    for (const {left, right} of productionList) {
      const changed = right.map(r => analyseFollowSet(left, r, table)).some(c => c)
      followSetChanged ||= changed
    }
  }
  for (const row of rows) {
    row.first = new Set([...row.first].sort())
    row.follow = new Set([...row.follow].sort())
  }
  return table
}

const startsWithToken = (symbols: ProductionSymbol[], token: string, table: NullableFirstFollowTable): boolean => {
  for (let i = 0; i < symbols.length; i++) {
    const {symbol, type} = symbols[i]
    if (type === SymbolType.Terminal) {
      return symbol === token
    }
    const row = table.rows.find(r => r.nonTerminalSymbol === symbol)!
    if (row.first.has(token)) return true
    if (!row.nullable) break
  }
  return false
}

const replaceToken = (token: string, replacements: ReplacementItem[]): string => {
  return replacements.find(r => r.find === token)?.replace ?? token
}

export const generateCode = (productionList: Production[], table: NullableFirstFollowTable, replacements: ReplacementItem[]): string => {
  const allTokens = [...new Set(table.rows.map(r => [...r.first, ...r.follow]).flat())]
  const gen = (leftSymbol: string, matches: Array<{left: ProductionSymbol, right: ProductionSymbol[], follow: boolean, tokens: string[]}>) => {
    const matchArms = matches.map(({right, tokens}) => {
      return `
${tokens.map(t => replaceToken(t, replacements)).join(' | ')} => {
  ${right.map(s => {
    if (s.type === SymbolType.Terminal) {
      return `tokenizer.eat(${replaceToken(s.symbol, replacements)});`
    }
    return `parse${s.symbol}(tokenizer);`
  }).join('\n')}
}
      `.trim()
    }).join('\n')
    return `
fn parse${leftSymbol} (tokenizer: &mut Tokenizer) -> Expression {
  match tokenizer.token() {
    ${matchArms}
    tok => panic!("expected ${matches.map(m => m.tokens).flat().map(t => `\`${replaceToken(t, replacements)}\``).join(', ')}, but got {:#?}", tok)
  }
}
    `.trim()
  }
  return table.rows.map(r => {
    const production = productionList.find(p => p.left.symbol === r.nonTerminalSymbol)!
    const tokenProductionList = allTokens.map(
      (token) => {
        const matchedRightList = production.right.map((right, index) => {
          const start = startsWithToken(right.content, token, table)
          const nullable = !right.content.length || right.content.every(s => {
            return s.type === SymbolType.NonTerminal &&
              table.rows.find(r => r.nonTerminalSymbol === s.symbol)!.nullable
          })
          const follow = nullable && r.follow.has(token)
          if (start || follow) {
            return {follow, index}
          }
          return null
        }).filter(Boolean)
        return matchedRightList
      },
      []
    )
    const dup = tokenProductionList.find(t => t.length > 1)
    if (dup) throw new Error('duplicate')

    const map = tokenProductionList.reduce(
      (map, list, tokenIndex) => {
        const firstItem = list[0]
        if (firstItem) {
          const {index, follow} = firstItem
          const record = map.get(index)
          if (record) {
            record.tokens.push(allTokens[tokenIndex])
          } else {
            map.set(index, {tokens: [allTokens[tokenIndex]], follow})
          }
        }
        return map
      },
      new Map<number, {tokens: string[], follow: boolean}>()
    )
    const matchProductionTokens = [...map.entries()].map(([index, {tokens, follow}]) => {
      const left = production.left
      const right = production.right[index].content
      return {left, right, follow, tokens}
    })
    return gen(r.nonTerminalSymbol, matchProductionTokens)
  }).join('\n')
}
