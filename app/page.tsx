"use client"

import { useState, useEffect } from "react"
import type { TradingBot, ActivePosition, Alert } from "@/types/trading"
import { BotCard } from "@/components/bot-card"
import { DiagnosticPanel } from "@/components/diagnostic-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, DollarSign, TrendingUp, Activity, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchBots, fetchActivePositions, fetchAlerts } from "@/lib/bybit-api"

export default function Dashboard() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [positions, setPositions] = useState<ActivePosition[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "connected" | "demo" | "error">("unknown")
  const [showDiagnostics, setShowDiagnostics] = useState(true) // Показываем диагностику по умолчанию
  const [isClient, setIsClient] = useState(false)

  // Исправляем проблему с гидратацией
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Функция для загрузки всех данных
  const loadData = async () => {
    console.log("🔄 === НАЧИНАЕМ ЗАГРУЗКУ ДАННЫХ ===")
    setIsLoading(true)
    try {
      const [botsData, positionsData, alertsData] = await Promise.all([
        fetchBots(),
        fetchActivePositions(),
        fetchAlerts(),
      ])

      console.log("📊 Полученные данные:")
      console.log("- Боты:", botsData)
      console.log("- Позиции:", positionsData)
      console.log("- Алерты:", alertsData)

      setBots(botsData)
      setPositions(positionsData)
      setAlerts(alertsData)
      setLastUpdate(new Date())

      // Проверяем тип данных
      const hasRealData = botsData.some((bot) => bot.name.includes("🔴 LIVE"))
      const hasDemoData = botsData.some((bot) => bot.name.includes("🎭 DEMO") || bot.name.includes("📊 Demo"))

      if (hasRealData) {
        setApiStatus("connected")
      } else if (hasDemoData) {
        setApiStatus("demo")
      } else {
        setApiStatus("error")
      }

      console.log("✅ Данные загружены, статус API:", hasRealData ? "connected" : hasDemoData ? "demo" : "error")
    } catch (error) {
      console.error("❌ Ошибка загрузки данных:", error)
      setApiStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем данные при первом запуске
  useEffect(() => {
    loadData()
  }, [])

  // Автообновление каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Подсчет общей статистики
  const totalBalance = bots.reduce((sum, bot) => sum + bot.balance, 0)
  const totalPnL = bots.reduce((sum, bot) => sum + bot.totalPnL, 0)
  const activeBots = bots.filter((bot) => bot.status === "active").length
  const totalTrades = bots.reduce((sum, bot) => sum + bot.totalTrades, 0)
  const totalOpenPositions = positions.length
  const totalOpenPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)

  const getApiStatusBadge = () => {
    switch (apiStatus) {
      case "connected":
        return <Badge className="bg-green-600">🟢 Реальные данные</Badge>
      case "demo":
        return <Badge className="bg-yellow-600">🎭 Демо режим</Badge>
      case "error":
        return <Badge variant="destructive">🔴 Ошибка</Badge>
      default:
        return <Badge variant="secondary">⚪ Проверка...</Badge>
    }
  }

  // Показываем загрузку до гидратации
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚀 Bybit Trading Dashboard</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-600">Загрузка...</p>
                <Badge variant="secondary">⚪ Инициализация...</Badge>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Инициализация дашборда...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Bybit Trading Dashboard</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">Последнее обновление: {lastUpdate.toLocaleTimeString("ru-RU")}</p>
              {getApiStatusBadge()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDiagnostics(!showDiagnostics)} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {showDiagnostics ? "Скрыть диагностику" : "Показать диагностику"}
            </Button>
            <Button onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Диагностическая панель */}
        {showDiagnostics && (
          <div className="bg-white rounded-lg border-2 border-blue-200">
            <DiagnosticPanel />
          </div>
        )}

        {/* API статус */}
        {apiStatus === "error" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">
                  ⚠️ Используются тестовые данные. Запустите диагностику для выявления проблем.
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowDiagnostics(true)}>
                Диагностика
              </Button>
            </div>
          </div>
        )}

        {apiStatus === "demo" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800">
                  🎭 Демо режим активен. Показываются тестовые данные для демонстрации функционала.
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowDiagnostics(true)}>
                Настроить API
              </Button>
            </div>
          </div>
        )}

        {apiStatus === "connected" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                🔴 Подключено к реальному Bybit API! Отображаются данные вашего аккаунта.
              </span>
            </div>
          </div>
        )}

        {/* Общая статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Общий баланс</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Открытые позиции</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalOpenPositions}</div>
              <div className={`text-xs mt-1 ${totalOpenPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                P&L: {totalOpenPnL >= 0 ? "+" : ""}${totalOpenPnL.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Активные боты</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {activeBots}/{bots.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activeBots} из {bots.length} работают
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Общий P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{totalPnL >= 0 ? "Прибыль" : "Убыток"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Статус загрузки */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Загрузка данных... (проверьте консоль браузера)
            </div>
          </div>
        )}

        {/* Боты */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">📊 Торговые боты</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} activePositions={positions} />
            ))}
          </div>
        </div>

        {/* Если нет данных */}
        {bots.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет активных ботов</h3>
            <p className="text-gray-500 mb-4">Запустите диагностику для выявления проблем с API</p>
            <Button onClick={() => setShowDiagnostics(true)}>Открыть диагностику</Button>
          </div>
        )}

        {/* Футер */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            🔍 Новая система диагностики поможет найти проблему • Откройте консоль браузера (F12) для детальных логов
          </p>
        </div>
      </div>
    </div>
  )
}
