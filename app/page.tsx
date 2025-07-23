"use client"

import { useState, useEffect } from "react"
import type { TradingBot, ActivePosition, Alert } from "@/types/trading"
import { BotCard } from "@/components/bot-card"
import { SetupGuide } from "@/components/setup-guide"
import { SimpleDiagnostic } from "@/components/simple-diagnostic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, DollarSign, TrendingUp, Activity, Users, Settings, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SystemStatus {
  environment: {
    NODE_ENV: string
    BYBIT_API_KEY_EXISTS: boolean
    BYBIT_API_SECRET_EXISTS: boolean
    BYBIT_API_KEY_LENGTH: number
    BYBIT_API_SECRET_LENGTH: number
    BYBIT_API_KEY_PREVIEW: string
    BYBIT_API_SECRET_PREVIEW: string
  }
  diagnosis: {
    keysExist: boolean
    keysValid: boolean
    keysConfigured: boolean
    issue: string
    solution: string
  }
}

export default function TradingDashboard() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [positions, setPositions] = useState<ActivePosition[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Проверка статуса системы
  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setSystemStatus(data)
      console.log("🔍 Статус системы:", data)
      return data.diagnosis?.keysConfigured || false
    } catch (error) {
      console.error("❌ Ошибка проверки статуса:", error)
      return false
    }
  }

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Сначала проверяем статус системы
      const isConfigured = await checkSystemStatus()

      if (!isConfigured) {
        console.log("⚠️ API ключи не настроены - пропускаем загрузку данных")
        setLoading(false)
        return
      }

      console.log("✅ API ключи настроены - загружаем данные")

      // Загружаем данные параллельно
      const [botsResponse, positionsResponse, alertsResponse] = await Promise.all([
        fetch("/api/bots"),
        fetch("/api/positions"),
        fetch("/api/alerts"),
      ])

      const [botsData, positionsData, alertsData] = await Promise.all([
        botsResponse.json(),
        positionsResponse.json(),
        alertsResponse.json(),
      ])

      console.log("📊 Данные получены:", {
        bots: botsData.bots?.length || 0,
        positions: positionsData.positions?.length || 0,
        alerts: alertsData.alerts?.length || 0,
      })

      setBots(botsData.bots || [])
      setPositions(positionsData.positions || [])
      setAlerts(alertsData.alerts || [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error("❌ Ошибка загрузки данных:", err)
      setError(err?.toString() || "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Автообновление каждые 30 секунд если API настроен
  useEffect(() => {
    if (systemStatus?.diagnosis?.keysConfigured) {
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    }
  }, [systemStatus])

  const getApiStatusBadge = () => {
    if (!systemStatus) {
      return <Badge variant="secondary">⚪ Проверка...</Badge>
    }

    if (systemStatus.diagnosis.keysConfigured) {
      return <Badge className="bg-green-600">🟢 API настроен</Badge>
    } else {
      return <Badge variant="destructive">🔴 Требуется настройка</Badge>
    }
  }

  // Если показываем настройку
  if (showSetup) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button onClick={() => setShowSetup(false)} variant="outline">
            ← Назад к дашборду
          </Button>
        </div>
        <SetupGuide />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔴 LIVE Trading Dashboard</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-muted-foreground">Последнее обновление: {lastUpdate.toLocaleTimeString("ru-RU")}</p>
            {getApiStatusBadge()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDiagnostics(!showDiagnostics)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {showDiagnostics ? "Скрыть" : "Показать"} диагностику
          </Button>
          <Button onClick={() => setShowSetup(true)} variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Настройка
          </Button>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Диагностика */}
      {showDiagnostics && (
        <div className="mb-6">
          <SimpleDiagnostic />
        </div>
      )}

      {/* Статус API ключей */}
      {systemStatus && !systemStatus.diagnosis.keysConfigured && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">{systemStatus.diagnosis.issue}</p>
                  <p className="text-sm text-red-600">{systemStatus.diagnosis.solution}</p>
                </div>
              </div>
              <Button onClick={() => setShowSetup(true)} size="sm">
                Настроить API
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статус подключения */}
      {systemStatus?.diagnosis?.keysConfigured && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                🔴 Подключено к реальному Bybit API! Отображаются данные вашего аккаунта.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ошибка */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Ошибка: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${bots.reduce((sum, bot) => sum + bot.balance, 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USDT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                bots.reduce((sum, bot) => sum + bot.totalPnL, 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${bots.reduce((sum, bot) => sum + bot.totalPnL, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные позиции</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">Открытых позиций</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные боты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.filter((bot) => bot.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Из {bots.length} ботов</p>
          </CardContent>
        </Card>
      </div>

      {/* Статус загрузки */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Загрузка данных с Bybit API...</p>
        </div>
      )}

      {/* Боты */}
      {systemStatus?.diagnosis?.keysConfigured && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">📊 Торговые боты</h2>
          {bots.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} activePositions={positions} />
              ))}
            </div>
          ) : !loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет активных ботов</h3>
                <p className="text-gray-600 mb-4">
                  API ключи настроены, но активных позиций не найдено. Проверьте ваш аккаунт на Bybit.
                </p>
                <Button onClick={() => setShowDiagnostics(true)} variant="outline">
                  Показать диагностику
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Позиции */}
      {positions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">📈 Активные позиции</h2>
          <div className="grid gap-4">
            {positions.map((position) => (
              <Card key={position.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{position.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {position.side} • Размер: {position.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${position.pnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">{position.pnlPercentage.toFixed(2)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Алерты */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">🔔 Последние уведомления</h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <Card
                key={alert.id}
                className={
                  alert.type === "error"
                    ? "border-red-200 bg-red-50"
                    : alert.type === "warning"
                      ? "border-yellow-200 bg-yellow-50"
                      : alert.type === "success"
                        ? "border-green-200 bg-green-50"
                        : "border-blue-200 bg-blue-50"
                }
              >
                <CardContent className="pt-4">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Футер */}
      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {systemStatus?.diagnosis?.keysConfigured
            ? "🔴 Подключено к реальному Bybit API • Демо режим отключен • Обновление каждые 30 секунд"
            : "🔧 Настройте API ключи для подключения к Bybit • Следуйте пошаговой инструкции выше"}
        </p>
      </div>
    </div>
  )
}
