"use client"

import { useState, useEffect } from "react"
import type { TradingBot, ActivePosition, Alert } from "@/types/trading"
import { BotCard } from "@/components/bot-card"
import { ApiStatus } from "@/components/api-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, DollarSign, TrendingUp, Activity, Users, Settings, Database, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchBots, fetchActivePositions, fetchAlerts } from "@/lib/bybit-api"
import { ApiTest } from "@/components/api-test"
import { directApiTest } from "@/lib/bybit-simple"

export default function Dashboard() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [positions, setPositions] = useState<ActivePosition[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [showApiSettings, setShowApiSettings] = useState(false)
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

      // Проверяем есть ли реальные данные
      const hasRealData = botsData.some((bot) => bot.name.includes("LIVE"))
      setApiStatus(hasRealData ? "connected" : "error")

      console.log("✅ Данные загружены, статус API:", hasRealData ? "connected" : "error")
    } catch (error) {
      console.error("❌ Ошибка загрузки данных:", error)
      setApiStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Принудительная загрузка реальных данных
  const forceLoadRealData = async () => {
    console.log("🚀 ПРИНУДИТЕЛЬНАЯ ЗАГРУЗКА РЕАЛЬНЫХ ДАННЫХ")
    await loadData()
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
        return <Badge className="bg-green-600">🟢 API Подключен</Badge>
      case "error":
        return <Badge variant="secondary">🔴 Тестовые данные</Badge>
      default:
        return <Badge variant="secondary">⚪ Проверка...</Badge>
    }
  }

  // Добавьте новую функцию в компонент:
  const handleQuickTest = async () => {
    console.log("⚡ Быстрый тест API...")
    const results = await directApiTest()
    console.log("⚡ Результаты быстрого теста:", results)
    alert(`Тест завершен! Проверьте консоль. Ошибок: ${results.errors.length}`)
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
            <Button onClick={() => setShowApiSettings(!showApiSettings)} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {showApiSettings ? "Скрыть настройки" : "Настройки API"}
            </Button>
            <Button onClick={handleQuickTest} variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Быстрый тест API
            </Button>
            <Button onClick={forceLoadRealData} disabled={isLoading} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Загрузить реальные данные
            </Button>
            <Button onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Настройки API */}
        {showApiSettings && (
          <div className="space-y-4">
            <ApiStatus />
            <ApiTest />
          </div>
        )}

        {/* API статус */}
        {apiStatus === "error" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">
                  Используются тестовые данные. API работает, но реальные данные не загружаются.
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={forceLoadRealData}>
                Попробовать снова
              </Button>
            </div>
          </div>
        )}

        {apiStatus === "connected" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Подключено к Bybit API! Отображаются реальные данные вашего аккаунта.
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
            <p className="text-gray-500">Проверьте консоль браузера для диагностики</p>
            <Button className="mt-4" onClick={forceLoadRealData}>
              Загрузить реальные данные
            </Button>
          </div>
        )}

        {/* Футер */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Dashboard обновляется автоматически • Откройте консоль браузера (F12) для детальных логов
          </p>
        </div>
      </div>
    </div>
  )
}
