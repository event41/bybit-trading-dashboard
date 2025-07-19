"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Key, CheckCircle, XCircle, AlertTriangle, Copy, Eye, EyeOff, Bug } from "lucide-react"
import { getApiStatus, testBybitConnection, diagnoseEnvironment } from "@/lib/bybit-simple"

export function ApiStatus() {
  const [status, setStatus] = useState<any>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [showKeys, setShowKeys] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)

  useEffect(() => {
    setStatus(getApiStatus())
    setDiagnosis(diagnoseEnvironment())
  }, [])

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await testBybitConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Ошибка тестирования",
        details: { error: error?.toString() },
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Скопировано в буфер обмена!")
  }

  const copyEnvTemplate = () => {
    const template = `BYBIT_API_KEY=твой_api_ключ_здесь
BYBIT_API_SECRET=твой_api_секрет_здесь
NODE_ENV=development
NEXT_PUBLIC_ENABLE_WEBSOCKET=true`
    copyToClipboard(template)
  }

  if (!status) return null

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Диагностика Bybit API
            {status.hasKeys ? (
              <Badge className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Настроено
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Не настроено
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Детальная диагностика */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Диагностика переменных окружения
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">API Key найден:</span>
                <span className={`ml-2 font-medium ${status.apiKey ? "text-green-600" : "text-red-600"}`}>
                  {status.apiKey ? "✅ Да" : "❌ Нет"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">API Secret найден:</span>
                <span className={`ml-2 font-medium ${status.apiSecret ? "text-green-600" : "text-red-600"}`}>
                  {status.apiSecret ? "✅ Да" : "❌ Нет"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">API Key длина:</span>
                <span className="ml-2 font-medium">{status.keyLength} символов</span>
              </div>
              <div>
                <span className="text-gray-600">API Secret длина:</span>
                <span className="ml-2 font-medium">{status.secretLength} символов</span>
              </div>
            </div>

            {diagnosis && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm">
                  <div>
                    <span className="text-gray-600">NODE_ENV:</span> <code>{diagnosis.nodeEnv}</code>
                  </div>
                  <div>
                    <span className="text-gray-600">Bybit переменные:</span> {diagnosis.bybitVars.length}
                  </div>
                  <div>
                    <span className="text-gray-600">Всего env переменных:</span> {diagnosis.allEnvKeys}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Статус ключей */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">API Key</span>
                {status.apiKey ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              {status.keyPreview && (
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {showKeys ? status.keyPreview.replace("...", "") : status.keyPreview}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => setShowKeys(!showKeys)} className="h-6 w-6 p-0">
                    {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">API Secret</span>
                {status.apiSecret ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              {status.secretPreview && (
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {showKeys ? status.secretPreview.replace("...", "") : status.secretPreview}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Инструкции по настройке */}
          {!status.hasKeys && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900 mb-2">Проблема с API ключами!</p>

                  <div className="space-y-2 text-red-800">
                    <p>
                      <strong>Проверьте:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        Файл <code className="bg-red-100 px-1 rounded">.env.local</code> существует в корне проекта
                      </li>
                      <li>Каждая переменная на отдельной строке</li>
                      <li>Нет пробелов вокруг знака =</li>
                      <li>Сервер перезапущен после создания файла</li>
                    </ul>
                  </div>

                  <div className="mt-3 bg-red-100 p-2 rounded text-xs font-mono">
                    <div>BYBIT_API_KEY=ваш_реальный_ключ</div>
                    <div>BYBIT_API_SECRET=ваш_реальный_секрет</div>
                    <div>NODE_ENV=development</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={copyEnvTemplate}>
                      <Copy className="h-3 w-3 mr-1" />
                      Копировать шаблон
                    </Button>
                    <a
                      href="https://www.bybit.com/app/user/api-management"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline text-xs"
                    >
                      Получить ключи на Bybit →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Тест подключения */}
          <div className="flex gap-2">
            <Button onClick={handleTestConnection} disabled={isTestingConnection} className="flex-1">
              <Key className="h-4 w-4 mr-2" />
              {isTestingConnection ? "Тестирование..." : "Тест подключения"}
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Обновить
            </Button>
          </div>

          {/* Результат теста */}
          {testResult && (
            <div
              className={`rounded-lg p-4 ${testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                  {testResult.message}
                </span>
              </div>
              {testResult.details && (
                <div className="text-xs text-gray-600 mt-2">
                  <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
