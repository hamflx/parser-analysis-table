export interface ProductionSymbol {
  type: 'ter' | 'nonter'
  content: string
}

export interface Production {
  left: ProductionSymbol
  right: ProductionSymbol[]
}

export interface TypingProduction {
  left: string
  right: string
}
