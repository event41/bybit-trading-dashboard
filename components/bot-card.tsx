"use client"

import { useState } from "react"
import type { TradingBot, ActivePosition } from "@/types/trading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PerformanceChart } from "@/components/performance-chart"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  AlertTriangle,
  Clock,
  Percent,
  BarChart3,
} from "lucide-react"
import { TradeHistory } from "@/components/trade-history"

interface BotCardProps {
  bot: TradingBot
  activePositions: ActivePosition[]
}

type TimePeriod = "week" | "month" | "all"

export function BotCard({ bot, activePositions }: BotCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month")

  // Фильтруем позиции для этого бота
  const botPositions = activePositions.filter((pos) => pos.botId === bot.id)

  // Рассчитываем дневную доходность в процентах от баланса
  const dailyReturnPercentage = (bot.dailyPnL / bot.balance) * 100

  // Фильтруем данные графика по выбранному периоду
  const getChartData = () => {
    const now = new Date()
    let daysBack = 30

    switch (selectedPeriod) {
      case "week":
        daysBack = 7
        break
      case "month":
        daysBack = 30
        break
      case "all":
        return bot.performanceHistory
    }

    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    return bot.performanceHistory.filter((point) => new Date(point.timestamp) >= cutoffDate)
  }

  const chartData = getChartData()

  const getStatusColor = (status: TradingBot["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "error":
        return "destructive"
    }
  }

  const getStatusText = (status: TradingBot["status"]) => {
    switch (status) {
      case "active":
        return "Активен"
      case "paused":
        return "Приостановлен"
      case "error":
        return "Ошибка"
    }
  }

  const getPeriodData = (period: TimePeriod) => {
    switch (period) {
      case "week":
        return { pnl: bot.weeklyPnL, label: "Неделя" }
      case "month":
        return { pnl: bot.monthlyPnL, label: "Месяц" }
      case "all":
        return { pnl: bot.totalPnL, label: "Все время" }
    }
  }

  const currentPeriodData = getPeriodData(selectedPeriod)

  // Подсчитываем общий PnL открытых позиций
  const totalOpenPnL = botPositions.reduce((sum, pos) => sum + pos.pnl, 0)

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{bot.name}</CardTitle>
          <Badge variant={getStatusColor(bot.status)}>{getStatusText(bot.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Основная статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Баланс</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${bot.balance.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {currentPeriodData.pnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-500">P&L ({currentPeriodData.label})</span>
            </div>
            <p className={`text-2xl font-bold ${currentPeriodData.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {currentPeriodData.pnl >= 0 ? "+" : ""}${currentPeriodData.pnl.toFixed(2)}
            </p>
          </div>
        </div>

        {/* График доходности */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">График доходности</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <PerformanceChart data={chartData} height={140} />
          </div>
        </div>

        {/* Дневная доходность */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Дневная доходность</span>
            </div>
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                dailyReturnPercentage >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {dailyReturnPercentage >= 0 ? "+" : ""}
              {dailyReturnPercentage.toFixed(2)}%
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg font-bold ${bot.dailyPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {bot.dailyPnL >= 0 ? "+" : ""}${bot.dailyPnL.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">от баланса ${bot.balance.toLocaleString()}</p>
            </div>

            <div className="flex items-center">
              {dailyReturnPercentage >= 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Прибыль</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  <span className="text-sm font-medium">Убыток</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Выбор временного периода */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(["week", "month", "all"] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1 text-xs"
            >
              {getPeriodData(period).label}
            </Button>
          ))}
        </div>

        {/* Открытые позиции */}
        {botPositions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Открытые позиции ({botPositions.length})
              </h4>
              <div className={`text-sm font-semibold ${totalOpenPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalOpenPnL >= 0 ? "+" : ""}${totalOpenPnL.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {botPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={position.side === "Buy" ? "default" : "destructive"}
                      className={`text-xs ${position.side === "Buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    >
                      {position.side}
                    </Badge>
                    <span className="font-medium">{position.symbol}</span>
                    <span className="text-gray-500">×{position.size}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${position.pnlPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {position.pnlPercentage >= 0 ? "+" : ""}
                      {position.pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Если нет открытых позиций */}
        {botPositions.length === 0 && bot.status === "active" && (
          <div className="text-center py-3 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            Нет открытых позиций
          </div>
        )}

        {/* Детальная статистика */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Сделки</span>
            </div>
            <p className="font-semibold text-gray-900">{bot.totalTrades}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Win Rate</span>
            </div>
            <p className="font-semibold text-gray-900">{bot.winRate.toFixed(1)}%</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Просадка</span>
            </div>
            <p className="font-semibold text-red-600">{bot.currentDrawdown.toFixed(1)}%</p>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Прибыльных сделок:</span>
          <span className="font-medium text-green-600">{bot.winTrades}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-500">Убыточных сделок:</span>
          <span className="font-medium text-red-600">{bot.lossTrades}</span>
        </div>

        {/* История сделок */}
        <TradeHistory trades={bot.tradeHistory} botName={bot.name} />

        {/* Последнее обновление */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          Обновлено: {new Date(bot.lastUpdate).toLocaleString("ru-RU")}
        </div>
      </CardContent>
    </Card>
  )
}
