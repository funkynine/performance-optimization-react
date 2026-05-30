const BASES = [
  'AAPL','GOOG','MSFT','AMZN','META','TSLA','NVDA','NFLX','AMD','INTC',
  'ORCL','IBM','CSCO','QCOM','AVGO','TXN','MU','AMAT','LRCX','KLAC',
  'JPM','BAC','GS','MS','C','WFC','BLK','AXP','V','MA',
  'JNJ','PFE','MRK','ABBV','BMY','LLY','AMGN','GILD','BIIB','REGN',
  'XOM','CVX','COP','SLB','EOG','PXD','MPC','VLO','PSX','HAL',
]

function generateSymbols(): string[] {
  const symbols: string[] = [...BASES]
  const suffixes = ['A','B','C','X','Y','Z','1','2','3']
  while (symbols.length < 500) {
    const base = BASES[symbols.length % BASES.length]
    const suffix = suffixes[Math.floor(symbols.length / BASES.length) % suffixes.length]
    symbols.push(`${base}${suffix}`)
  }
  return symbols
}

export const SYMBOLS = generateSymbols()
