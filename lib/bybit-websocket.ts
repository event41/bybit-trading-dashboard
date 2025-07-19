"use client"

export interface WebSocketMessage {
  topic: string
  type: string
  data: any
  ts: number
}

export interface PositionUpdate {
  symbol: string
  side: "Buy" | "Sell"
  size: string
  positionValue: string
  entryPrice: string
  markPrice: string
  unrealisedPnl: string
  updatedTime: string
}

export class BybitWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private subscriptions: Set<string> = new Set()

  // Колбэки для разных типов данных
  private onPositionUpdate?: (positions: PositionUpdate[]) => void
  private onPriceUpdate?: (prices: Record<string, number>) => void
  private onConnectionChange?: (connected: boolean) => void

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Публичный WebSocket Bybit (не требует аутентификации для цен)
      this.ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")

      this.ws.onopen = () => {
        console.log("✅ WebSocket подключен к Bybit")
        this.isConnected = true
        this.reconnectAttempts = 0
        this.onConnectionChange?.(true)

        // Подписываемся на обновления цен основных пар
        this.subscribeToTickers(["BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "DOGEUSDT", "BNBUSDT"])
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Ошибка парсинга WebSocket сообщения:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("❌ WebSocket отключен")
        this.isConnected = false
        this.onConnectionChange?.(false)
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket ошибка:", error)
      }
    } catch (error) {
      console.error("Ошибка подключения WebSocket:", error)
      this.handleReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage) {
    if (message.topic?.startsWith("tickers.")) {
      // Обновления цен
      const data = message.data
      if (data && data.symbol && data.lastPrice) {
        const prices: Record<string, number> = {}
        prices[data.symbol] = Number.parseFloat(data.lastPrice)
        this.onPriceUpdate?.(prices)
      }
    }
  }

  private subscribeToTickers(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    symbols.forEach((symbol) => {
      const subscription = {
        op: "subscribe",
        args: [`tickers.${symbol}`],
      }

      this.ws!.send(JSON.stringify(subscription))
      this.subscriptions.add(`tickers.${symbol}`)
      console.log(`📊 Подписка на ${symbol}`)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Максимальное количество попыток переподключения достигнуто")
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  // Публичные методы для подписки на события
  public onPositionsUpdate(callback: (positions: PositionUpdate[]) => void) {
    this.onPositionUpdate = callback
  }

  public onPricesUpdate(callback: (prices: Record<string, number>) => void) {
    this.onPriceUpdate = callback
  }

  public onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.onConnectionChange = callback
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Добавить новую подписку
  public subscribe(symbol: string) {
    this.subscribeToTickers([symbol])
  }
}

// Экспортируем единственный экземпляр
export const bybitWebSocket = new BybitWebSocket()
