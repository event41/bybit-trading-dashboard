export interface TradingBot {
  id: string
  name: string
  status: "active" | "paused" | "error"
  balance: number
  totalPnL: number
  dailyPnL: number
  weeklyPnL: number
  monthlyPnL: number
  totalTrades: number
  winTrades: number
  lossTrades: number
  winRate: number
  maxDrawdown: number
  currentDrawdown: number
  lastUpdate: string
  performanceHistory: PerformancePoint[]
  tradeHistory: TradeRecord[]
}

export interface TradeRecord {
  id: string
  symbol: string
  side: "Buy" | "Sell"
  size: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercentage: number
  openTime: string
  closeTime: string
  duration: number // в минутах
}

export interface PerformancePoint {
  timestamp: string
  balance: number
  pnl: number
  cumulativePnL: number
}

export interface ActivePosition {
  id: string
  botId: string
  symbol: string
  side: "Buy" | "Sell"
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  openTime: string
}

export interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  timestamp: string
  botId?: string
}

export interface BalanceHistory {
  timestamp: string
  balance: number
  pnl: number
}
