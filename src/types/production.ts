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
}

export interface Production {
  left: ProductionSymbol
  right: ProductionRight[]
}

export interface TypingProduction {
  left: string
  right: string
}
