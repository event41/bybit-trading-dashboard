"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { runFullDiagnostic, quickDiagnostic, type FullDiagnostic } from "@/lib/bybit-diagnostics"
import { CheckCircle, XCircle, AlertTriangle, Play, Bug, Zap, Copy, Eye, EyeOff, RefreshCw } from "lucide-react"

export function DiagnosticPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<FullDiagnostic | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [quickResults, setQuickResults] = useState<any>(null)

  const runQuickTest = async () => {
    console.log("⚡ Запуск быстрой диагностики...")
    const quick = await quickDiagnostic()
    setQuickResults(quick)
    console.log("⚡ Результаты быстрой диагностики:", quick)
  }

  const runFullTest = async () => {
    setIsRunning(true)
    try {
      console.log("🔍 Запуск полной диагностики...")
      const diagnostic = await runFullDiagnostic()
      setResults(diagnostic)
      console.log("🔍 Результаты полной диагностики:", diagnostic)
    } catch (error) {
      console.error("❌ Ошибка диагностики:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const copyResults = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2)
      navigator.clipboard.writeText(text)
      alert("Результаты скопированы в буфер обмена!")
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (success: boolean, label: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="text-xs">
        {success ? "✅" : "❌"} {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Диагностика Bybit API (Новая система)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Быстрая диагностика */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">⚡ Быстрая диагностика</h4>
              <Button size="sm" onClick={runQuickTest} variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                Запустить
              </Button>
            </div>

            {quickResults && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Окружение:</span>
                  <Badge variant="secondary">{quickResults.environment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API ключи:</span>
                  {getStatusBadge(quickResults.hasKeys, quickResults.hasKeys ? "Найдены" : "Отсутствуют")}
                </div>
                <div className="flex items-center justify-between">
                  <span>Публичный API:</span>
                  {getStatusBadge(
                    quickResults.publicApiWorks,
                    quickResults.publicApiWorks ? "Работает" : "Не работает",
                  )}
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-xs">
                  💡 <strong>Рекомендация:</strong> {quickResults.recommendation}
                </div>
              </div>
            )}
          </div>

          {/* Полная диагностика */}
          <div className="flex gap-2">
            <Button onClick={runFullTest} disabled={isRunning} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "Диагностика..." : "Полная диагностика"}
              {isRunning && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
            </Button>

            {results && (
              <Button onClick={copyResults} variant="outline" size="sm">
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Результаты полной диагностики */}
          {results && (
            <div className="space-y-4">
              {/* Общий статус */}
              <div
                className={`rounded-lg p-4 ${
                  results.summary.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(results.summary.success)}
                  <span className={`font-medium ${results.summary.success ? "text-green-800" : "text-red-800"}`}>
                    {results.summary.success ? "✅ ВСЕ РАБОТАЕТ!" : "❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ"}
                  </span>
                </div>
                <p className={`text-sm ${results.summary.success ? "text-green-700" : "text-red-700"}`}>
                  <strong>Проблема:</strong> {results.summary.mainIssue}
                </p>
                <p className={`text-sm mt-1 ${results.summary.success ? "text-green-700" : "text-red-700"}`}>
                  <strong>Рекомендация:</strong> {results.summary.recommendation}
                </p>
              </div>

              {/* Детальные результаты */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-3 rounded-lg border ${
                    results.publicApi.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(results.publicApi.success)}
                    <span className="font-medium text-sm">Публичный API</span>
                  </div>
                  <p className="text-xs text-gray-600">{results.publicApi.message}</p>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    results.signature.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(results.signature.success)}
                    <span className="font-medium text-sm">Подпись</span>
                  </div>
                  <p className="text-xs text-gray-600">{results.signature.message}</p>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    results.privateApi.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(results.privateApi.success)}
                    <span className="font-medium text-sm">Приватный API</span>
                  </div>
                  <p className="text-xs text-gray-600">{results.privateApi.message}</p>
                </div>
              </div>

              {/* Информация об окружении */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Информация об окружении</h4>
                  <Button size="sm" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>

                {showDetails && (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Платформа:</span>
                        <span className="ml-2 font-medium">{results.environment.platform}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NODE_ENV:</span>
                        <span className="ml-2 font-medium">{results.environment.nodeEnv}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">API Key:</span>
                        <span className="ml-2 font-medium">{results.environment.bybitApiKey}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">API Secret:</span>
                        <span className="ml-2 font-medium">{results.environment.bybitApiSecret}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-xs text-gray-600">Детали API ключей:</div>
                      <div className="mt-1 space-y-1 text-xs">
                        <div>Длина API Key: {results.apiKeys.apiKeyLength}</div>
                        <div>Длина API Secret: {results.apiKeys.apiSecretLength}</div>
                        <div>Тестовые ключи: {results.apiKeys.isTestKeys ? "Да" : "Нет"}</div>
                        <div>Ключи валидны: {results.apiKeys.keysValid ? "Да" : "Нет"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ошибки */}
              {(!results.publicApi.success || !results.signature.success || !results.privateApi.success) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 mb-2">Обнаруженные ошибки:</p>
                      <ul className="space-y-1 text-yellow-800 text-xs">
                        {!results.publicApi.success && <li>• Публичный API: {results.publicApi.error}</li>}
                        {!results.signature.success && <li>• Подпись: {results.signature.error}</li>}
                        {!results.privateApi.success && <li>• Приватный API: {results.privateApi.error}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Инструкции */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Как использовать диагностику:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
              <li>
                Сначала запустите <strong>быструю диагностику</strong>
              </li>
              <li>
                Если есть проблемы, запустите <strong>полную диагностику</strong>
              </li>
              <li>
                Откройте <strong>консоль браузера (F12)</strong> для детальных логов
              </li>
              <li>Скопируйте результаты и отправьте разработчику при необходимости</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
