"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react"

interface DiagnosticResult {
  success: boolean
  message: string
  details?: any
}

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

export function SimpleDiagnostic() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [apiTest, setApiTest] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setSystemStatus(data)
      console.log("📊 Статус системы:", data)
    } catch (error) {
      console.error("❌ Ошибка проверки статуса:", error)
    }
  }

  const testApiConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bybit/test")
      const data = await response.json()
      setApiTest(data)
      console.log("🔍 Тест API:", data)
    } catch (error) {
      console.error("❌ Ошибка теста API:", error)
      setApiTest({
        success: false,
        message: "Ошибка подключения к API: " + error?.toString(),
        details: { error: error?.toString() },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (success: boolean, text: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className={success ? "bg-green-600" : ""}>
        {success ? "✅" : "❌"} {text}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />🔍 Диагностика системы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Кнопки управления */}
        <div className="flex gap-2">
          <Button onClick={checkSystemStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Проверить статус
          </Button>
          <Button onClick={testApiConnection} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Тест API
          </Button>
        </div>

        {/* Статус системы */}
        {systemStatus && (
          <div className="space-y-4">
            <h3 className="font-semibold">📊 Статус переменных окружения</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.environment.BYBIT_API_KEY_EXISTS)}
                  <span className="text-sm">API Key найден</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.environment.BYBIT_API_SECRET_EXISTS)}
                  <span className="text-sm">API Secret найден</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.diagnosis.keysValid)}
                  <span className="text-sm">Ключи валидны</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.diagnosis.keysConfigured)}
                  <span className="text-sm">Ключи настроены</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">NODE_ENV:</span> {systemStatus.environment.NODE_ENV}
                </div>
                <div>
                  <span className="text-gray-600">API Key длина:</span> {systemStatus.environment.BYBIT_API_KEY_LENGTH}
                </div>
                <div>
                  <span className="text-gray-600">API Secret длина:</span>{" "}
                  {systemStatus.environment.BYBIT_API_SECRET_LENGTH}
                </div>
                {systemStatus.environment.BYBIT_API_KEY_PREVIEW && (
                  <div>
                    <span className="text-gray-600">API Key:</span> {systemStatus.environment.BYBIT_API_KEY_PREVIEW}
                  </div>
                )}
              </div>
            </div>

            {/* Общий статус */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemStatus.diagnosis.keysConfigured)}
                <span className="font-medium">{systemStatus.diagnosis.issue}</span>
              </div>
              <p className="text-sm text-gray-600">{systemStatus.diagnosis.solution}</p>
            </div>
          </div>
        )}

        {/* Результат теста API */}
        {apiTest && (
          <div className="space-y-4">
            <h3 className="font-semibold">🔌 Тест подключения к Bybit API</h3>

            <div
              className={`p-4 rounded-lg border ${
                apiTest.success
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 dark:bg-red-950/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(apiTest.success)}
                <span className="font-medium">{apiTest.success ? "Подключение успешно" : "Ошибка подключения"}</span>
              </div>
              <p className={`text-sm ${apiTest.success ? "text-green-700" : "text-red-700"}`}>{apiTest.message}</p>

              {apiTest.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Показать детали
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(apiTest.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Статусы компонентов */}
        <div className="space-y-4">
          <h3 className="font-semibold">🧩 Статус компонентов</h3>

          <div className="flex flex-wrap gap-2">
            {systemStatus && (
              <>
                {getStatusBadge(systemStatus.environment.BYBIT_API_KEY_EXISTS, "API Key")}
                {getStatusBadge(systemStatus.environment.BYBIT_API_SECRET_EXISTS, "API Secret")}
                {getStatusBadge(systemStatus.diagnosis.keysValid, "Валидация")}
                {getStatusBadge(systemStatus.diagnosis.keysConfigured, "Конфигурация")}
              </>
            )}
            {apiTest && getStatusBadge(apiTest.success, "API Connection")}
          </div>
        </div>

        {/* Рекомендации */}
        {systemStatus && !systemStatus.diagnosis.keysConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Требуется действие</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">{systemStatus.diagnosis.solution}</p>
            <div className="text-xs text-yellow-600">
              <div>1. Создайте файл .env.local в корне проекта</div>
              <div>2. Добавьте реальные API ключи с Bybit</div>
              <div>3. Перезапустите сервер разработки</div>
            </div>
          </div>
        )}

        {/* Информация о системе */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <div>Последняя проверка: {new Date().toLocaleString("ru-RU")}</div>
          <div>Версия: Next.js App Router</div>
          <div>Режим: {systemStatus?.environment.NODE_ENV || "unknown"}</div>
        </div>
      </CardContent>
    </Card>
  )
}
