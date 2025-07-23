"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, FileText, Copy, Eye, EyeOff } from "lucide-react"

export function EnvDiagnostic() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showKeys, setShowKeys] = useState(false)

  const checkEnvironment = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Проверяем переменные окружения...")

      const response = await fetch("/api/env-check")
      const data = await response.json()

      setEnvInfo(data)
      console.log("📋 Результат проверки окружения:", data)
    } catch (error) {
      console.error("❌ Ошибка проверки окружения:", error)
      setEnvInfo({ error: error?.toString() })
    } finally {
      setIsLoading(false)
    }
  }

  const copyEnvTemplate = () => {
    const template = `# Замените на ваши РЕАЛЬНЫЕ ключи с Bybit
BYBIT_API_KEY=ваш_реальный_api_ключ_здесь
BYBIT_API_SECRET=ваш_реальный_api_секрет_здесь

# Дополнительные настройки
NODE_ENV=development
NEXT_PUBLIC_ENABLE_WEBSOCKET=true`

    navigator.clipboard.writeText(template)
    alert("Шаблон .env.local скопирован в буфер обмена!")
  }

  const copyTroubleshootingSteps = () => {
    const steps = `# ПОШАГОВОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С API КЛЮЧАМИ

## 1. Проверьте расположение файла .env.local
Файл должен быть в корневой папке проекта (рядом с package.json):

my-project/
├── package.json
├── next.config.js
├── .env.local ← ЗДЕСЬ
└── app/

## 2. Проверьте содержимое файла .env.local
BYBIT_API_KEY=ваш_реальный_ключ_без_пробелов
BYBIT_API_SECRET=ваш_реальный_секрет_без_пробелов

## 3. Перезапустите сервер
Ctrl+C (остановить)
npm run dev (запустить заново)

## 4. Проверьте права доступа API ключей на Bybit
- Войдите на bybit.com
- API Management
- Проверьте что ключи активны
- Права: Read-Only или Trading (для тестирования)

## 5. Если не помогает - создайте новые ключи
- Удалите старые ключи на Bybit
- Создайте новые с правами Trading
- Обновите .env.local
- Перезапустите сервер`

    navigator.clipboard.writeText(steps)
    alert("Инструкция по исправлению скопирована!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Диагностика переменных окружения
          <Badge variant="destructive">Проблема найдена</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Критическое предупреждение */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">🚨 API ключи не найдены в системе!</h4>
              <p className="text-red-800 text-sm mb-3">
                Система не может найти переменные окружения BYBIT_API_KEY и BYBIT_API_SECRET. Это означает проблему с
                файлом .env.local или сервер не был перезапущен.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка проверки */}
        <Button onClick={checkEnvironment} disabled={isLoading} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Проверяем окружение..." : "Проверить переменные окружения"}
        </Button>

        {/* Результаты проверки */}
        {envInfo && !envInfo.error && (
          <div className="space-y-4">
            {/* Статус */}
            <div
              className={`rounded-lg p-4 ${
                envInfo.diagnosis.keysFound ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {envInfo.diagnosis.keysFound ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${envInfo.diagnosis.keysFound ? "text-green-800" : "text-red-800"}`}>
                  {envInfo.diagnosis.issue}
                </span>
              </div>
              <p className={`text-sm ${envInfo.diagnosis.keysFound ? "text-green-700" : "text-red-700"}`}>
                💡 <strong>Рекомендация:</strong> {envInfo.diagnosis.recommendation}
              </p>
            </div>

            {/* Детальная информация */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Детальная информация</h4>
                <Button size="sm" variant="ghost" onClick={() => setShowKeys(!showKeys)}>
                  {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">NODE_ENV:</span>
                  <span className="ml-2 font-medium">{envInfo.environment.NODE_ENV}</span>
                </div>
                <div>
                  <span className="text-gray-600">Всего переменных:</span>
                  <span className="ml-2 font-medium">{envInfo.environment.totalEnvVars}</span>
                </div>
                <div>
                  <span className="text-gray-600">API Key найден:</span>
                  <span
                    className={`ml-2 font-medium ${
                      envInfo.environment.bybitApiKeyExists ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {envInfo.environment.bybitApiKeyExists ? "✅ Да" : "❌ Нет"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">API Secret найден:</span>
                  <span
                    className={`ml-2 font-medium ${
                      envInfo.environment.bybitApiSecretExists ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {envInfo.environment.bybitApiSecretExists ? "✅ Да" : "❌ Нет"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Длина API Key:</span>
                  <span className="ml-2 font-medium">{envInfo.environment.bybitApiKeyLength} символов</span>
                </div>
                <div>
                  <span className="text-gray-600">Длина API Secret:</span>
                  <span className="ml-2 font-medium">{envInfo.environment.bybitApiSecretLength} символов</span>
                </div>
              </div>

              {showKeys && (envInfo.environment.bybitApiKeyPreview || envInfo.environment.bybitApiSecretPreview) && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-2">Превью ключей:</div>
                  {envInfo.environment.bybitApiKeyPreview && (
                    <div className="font-mono text-xs mb-1">API Key: {envInfo.environment.bybitApiKeyPreview}</div>
                  )}
                  {envInfo.environment.bybitApiSecretPreview && (
                    <div className="font-mono text-xs">API Secret: {envInfo.environment.bybitApiSecretPreview}</div>
                  )}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                BYBIT переменные: {envInfo.environment.allBybitVars.join(", ") || "Нет"}
              </div>
            </div>
          </div>
        )}

        {/* Ошибка */}
        {envInfo?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900 mb-2">Ошибка проверки окружения:</p>
                <p className="text-red-800 text-xs font-mono">{envInfo.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Пошаговое исправление */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-3">🔧 Пошаговое исправление:</h4>

          <div className="space-y-3 text-sm text-yellow-800">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <div>
                <p className="font-medium">Проверьте расположение файла .env.local</p>
                <p className="text-xs mt-1">Файл должен быть в корневой папке проекта (рядом с package.json)</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <div>
                <p className="font-medium">Проверьте содержимое файла</p>
                <div className="mt-2 bg-yellow-100 p-2 rounded text-xs font-mono">
                  <div>BYBIT_API_KEY=ваш_ключ_без_пробелов</div>
                  <div>BYBIT_API_SECRET=ваш_секрет_без_пробелов</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <div>
                <p className="font-medium">Перезапустите сервер</p>
                <div className="mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
                  <div># Остановите: Ctrl+C</div>
                  <div># Запустите: npm run dev</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <div>
                <p className="font-medium">Создайте новые ключи с правами Trading</p>
                <p className="text-xs mt-1">Read-Only может не работать для всех операций</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={copyEnvTemplate}>
              <Copy className="h-3 w-3 mr-1" />
              Копировать шаблон .env.local
            </Button>
            <Button size="sm" variant="outline" onClick={copyTroubleshootingSteps}>
              <FileText className="h-3 w-3 mr-1" />
              Копировать инструкцию
            </Button>
            <a
              href="https://www.bybit.com/app/user/api-management"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Создать новые ключи →
            </a>
          </div>
        </div>

        {/* Рекомендация по правам доступа */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Рекомендация по правам доступа:</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Для тестирования:</strong> Создайте ключи с правами <strong>"Trading"</strong>
              вместо "Read-Only"
            </p>
            <p>
              <strong>Причина:</strong> Read-Only может блокировать некоторые запросы к API, даже если они только читают
              данные
            </p>
            <p>
              <strong>Безопасность:</strong> Не включайте права на вывод средств (Withdraw)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
