"use client"

import { useState } from "react"
import type { TradeRecord } from "@/types/trading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, History, Clock } from "lucide-react"

interface TradeHistoryProps {
  trades: TradeRecord[]
  botName: string
}

export function TradeHistory({ trades, botName }: TradeHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCount, setShowCount] = useState(10)

  const displayedTrades = trades.slice(0, showCount)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}м`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}ч ${remainingMinutes}м`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          История сделок ({trades.length})
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <div className="max-h-80 overflow-y-auto space-y-2">
            {displayedTrades.map((trade) => (
              <div key={trade.id} className="bg-gray-50 rounded-lg p-3 text-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={trade.side === "Buy" ? "default" : "destructive"}
                      className={`text-xs ${trade.side === "Buy" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                    >
                      {trade.side}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                    <span className="text-gray-500">×{trade.size}</span>
                  </div>
                  <div className={`font-semibold ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <div>
                    <span className="text-gray-500">Вход:</span> ${trade.entryPrice.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-500">Выход:</span> ${trade.exitPrice.toLocaleString()}
                  </div>
                  <div className={trade.pnlPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                    <span className="text-gray-500">Доходность:</span> {trade.pnlPercentage >= 0 ? "+" : ""}
                    {trade.pnlPercentage.toFixed(2)}%
                  </div>
                  <div>
                    <span className="text-gray-500">Длительность:</span> {formatDuration(trade.duration)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(trade.closeTime).toLocaleString("ru-RU")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {trades.length > showCount && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => setShowCount(showCount + 10)} className="text-xs">
                Показать еще {Math.min(10, trades.length - showCount)} сделок
              </Button>
            </div>
          )}

          {showCount >= trades.length && trades.length > 10 && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => setShowCount(10)} className="text-xs">
                Свернуть
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
