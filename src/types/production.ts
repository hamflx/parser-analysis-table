export enum SymbolType {
  NonTerminal,
  Terminal
}

export interface ProductionSymbol {
  type: SymbolType
  symbol: string
}

export interface ProductionRight {
  content: ProductionSymbol[]
  emits: string
  acceptPrefix?: boolean
  passToRight?: boolean
}

export interface Production {
  left: ProductionSymbol
  right: ProductionRight[]
}

export interface TypingProduction {
  left: string
  right: string
  emits: string
}

export interface NullableFirstFollowTableRow {
  nonTerminalSymbol: string
  nullable: boolean
  first: Set<string>
  follow: Set<string>
}

export interface NullableFirstFollowTable {
  rows: NullableFirstFollowTableRow[]
}

export interface ReplacementItem {
  find: string
  replace: string
}
