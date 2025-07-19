"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { directApiTest, testBybitConnection, getApiStatus } from "@/lib/bybit-simple"
import { CheckCircle, XCircle, Play, Bug, Zap } from "lucide-react"

export function ApiTest() {
  const [isTestingDirect, setIsTestingDirect] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [directResults, setDirectResults] = useState<any>(null)
  const [connectionResults, setConnectionResults] = useState<any>(null)

  const handleDirectTest = async () => {
    setIsTestingDirect(true)
    try {
      console.log("🧪 Запускаем прямой тест API...")
      const results = await directApiTest()
      setDirectResults(results)
      console.log("🧪 Результаты прямого теста:", results)
    } catch (error) {
      console.error("❌ Ошибка прямого теста:", error)
      setDirectResults({ error: error?.toString() })
    } finally {
      setIsTestingDirect(false)
    }
  }

  const handleConnectionTest = async () => {
    setIsTestingConnection(true)
    try {
      console.log("🔍 Запускаем тест подключения...")
      const results = await testBybitConnection()
      setConnectionResults(results)
      console.log("🔍 Результаты теста подключения:", results)
    } catch (error) {
      console.error("❌ Ошибка теста подключения:", error)
      setConnectionResults({ success: false, error: error?.toString() })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const apiStatus = getApiStatus()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Тестирование API (Новая версия)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Статус API ключей */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Статус API ключей:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">API Key:</span>
              <span className={`ml-2 font-medium ${apiStatus.apiKey ? "text-green-600" : "text-red-600"}`}>
                {apiStatus.apiKey ? "✅ Найден" : "❌ Не найден"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">API Secret:</span>
              <span className={`ml-2 font-medium ${apiStatus.apiSecret ? "text-green-600" : "text-red-600"}`}>
                {apiStatus.apiSecret ? "✅ Найден" : "❌ Не найден"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Источник:</span>
              <span className="ml-2 font-medium">{apiStatus.source}</span>
            </div>
            <div>
              <span className="text-gray-600">Длина ключа:</span>
              <span className="ml-2 font-medium">{apiStatus.keyLength} символов</span>
            </div>
          </div>
        </div>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleConnectionTest} disabled={isTestingConnection} className="h-16">
            <Zap className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div>{isTestingConnection ? "Тестирование..." : "Тест подключения"}</div>
              <div className="text-xs opacity-75">Быстрая проверка API</div>
            </div>
          </Button>

          <Button
            onClick={handleDirectTest}
            disabled={isTestingDirect}
            variant="outline"
            className="h-16 bg-transparent"
          >
            <Play className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div>{isTestingDirect ? "Тестирование..." : "Прямой тест"}</div>
              <div className="text-xs opacity-75">Детальная проверка всех эндпоинтов</div>
            </div>
          </Button>
        </div>

        {/* Результаты теста подключения */}
        {connectionResults && (
          <div
            className={`rounded-lg p-4 ${
              connectionResults.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {connectionResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${connectionResults.success ? "text-green-800" : "text-red-800"}`}>
                Тест подключения: {connectionResults.success ? "УСПЕХ" : "ПРОВАЛ"}
              </span>
            </div>
            <p className={`text-sm ${connectionResults.success ? "text-green-700" : "text-red-700"}`}>
              {connectionResults.message}
            </p>
            {connectionResults.details && (
              <div className="mt-2 text-xs">
                <pre className="bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(connectionResults.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Результаты прямого теста */}
        {directResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-800">Результаты прямого теста:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Баланс:</span>
                <Badge variant={directResults.balance ? "default" : "destructive"}>
                  {directResults.balance ? "✅ OK" : "❌ FAIL"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Позиции:</span>
                <Badge variant={directResults.positions ? "default" : "destructive"}>
                  {directResults.positions ? "✅ OK" : "❌ FAIL"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Сделки:</span>
                <Badge variant={directResults.trades ? "default" : "destructive"}>
                  {directResults.trades ? "✅ OK" : "❌ FAIL"}
                </Badge>
              </div>
              {directResults.errors && directResults.errors.length > 0 && (
                <div className="mt-2">
                  <span className="text-red-600 font-medium">Ошибки:</span>
                  <ul className="list-disc list-inside text-red-600 text-xs mt-1">
                    {directResults.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Инструкция */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">📋 Инструкция по тестированию:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Нажмите "Тест подключения" для быстрой проверки</li>
              <li>Если тест провалится, нажмите "Прямой тест" для детальной диагностики</li>
              <li>Откройте консоль браузера (F12) для просмотра детальных логов</li>
              <li>Скопируйте сообщения об ошибках из консоли для анализа</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
