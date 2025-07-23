"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, FileText, Copy, Folder, Bug } from "lucide-react"

export function DetailedDiagnostic() {
  const [envResults, setEnvResults] = useState<any>(null)
  const [fileResults, setFileResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDetailedDiagnostic = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Запуск детальной диагностики...")

      // Проверяем переменные окружения
      const envResponse = await fetch("/api/debug/env")
      const envData = await envResponse.json()
      setEnvResults(envData)

      // Проверяем файловую систему
      const fileResponse = await fetch("/api/debug/files")
      const fileData = await fileResponse.json()
      setFileResults(fileData)

      console.log("📊 Результаты диагностики:")
      console.log("- Переменные окружения:", envData)
      console.log("- Файловая система:", fileData)
    } catch (error) {
      console.error("❌ Ошибка детальной диагностики:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyEnvTemplate = () => {
    const template = `BYBIT_API_KEY=ваш_реальный_api_ключ_здесь
BYBIT_API_SECRET=ваш_реальный_api_секрет_здесь
NODE_ENV=development`

    navigator.clipboard.writeText(template)
    alert("Шаблон .env.local скопирован!")
  }

  const copyInstructions = () => {
    const instructions = `# ПОШАГОВОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ

## 1. Найдите корневую папку проекта
Найдите папку где лежит файл package.json

## 2. Создайте файл .env.local
В той же папке где package.json создайте файл .env.local

## 3. Добавьте в файл .env.local:
BYBIT_API_KEY=ваш_реальный_api_ключ_здесь
BYBIT_API_SECRET=ваш_реальный_api_секрет_здесь
NODE_ENV=development

## 4. Сохраните файл

## 5. Полностью перезапустите сервер:
Ctrl+C (остановить)
npm run dev (запустить)

## 6. Обновите страницу в браузере`

    navigator.clipboard.writeText(instructions)
    alert("Инструкция скопирована!")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-700"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Детальная диагностика проблемы
          <Badge variant="destructive">Критическая ошибка</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Кнопка запуска */}
        <Button onClick={runDetailedDiagnostic} disabled={isLoading} className="w-full" size="lg">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Диагностика..." : "Запустить детальную диагностику"}
        </Button>

        {/* Результаты переменных окружения */}
        {envResults && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Переменные окружения (Сервер)
            </h3>

            {/* Основная проблема */}
            <div className={`rounded-lg p-4 border ${getSeverityColor(envResults.diagnosis.severity)}`}>
              <div className="flex items-start gap-3">
                {envResults.diagnosis.severity === "critical" ? (
                  <XCircle className="h-5 w-5 mt-0.5" />
                ) : envResults.diagnosis.severity === "info" ? (
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                )}
                <div>
                  <p className="font-medium mb-1">{envResults.diagnosis.issue}</p>
                  <p className="text-sm">{envResults.diagnosis.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Детальная информация */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Детальная информация:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">API Key найден:</span>
                  <span
                    className={`ml-2 font-medium ${envResults.environment.hasApiKey ? "text-green-600" : "text-red-600"}`}
                  >
                    {envResults.environment.hasApiKey ? "✅ Да" : "❌ Нет"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">API Secret найден:</span>
                  <span
                    className={`ml-2 font-medium ${envResults.environment.hasApiSecret ? "text-green-600" : "text-red-600"}`}
                  >
                    {envResults.environment.hasApiSecret ? "✅ Да" : "❌ Нет"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Длина API Key:</span>
                  <span className="ml-2 font-medium">{envResults.environment.apiKeyLength} символов</span>
                </div>
                <div>
                  <span className="text-gray-600">Длина API Secret:</span>
                  <span className="ml-2 font-medium">{envResults.environment.apiSecretLength} символов</span>
                </div>
                <div>
                  <span className="text-gray-600">NODE_ENV:</span>
                  <span className="ml-2 font-medium">{envResults.environment.nodeEnv}</span>
                </div>
                <div>
                  <span className="text-gray-600">Всего переменных:</span>
                  <span className="ml-2 font-medium">{envResults.environment.totalEnvVars}</span>
                </div>
              </div>

              {envResults.environment.hasApiKey && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-1">Превью ключей:</div>
                  <div className="font-mono text-xs">
                    <div>API Key: {envResults.environment.apiKeyPreview}</div>
                    <div>API Secret: {envResults.environment.apiSecretPreview}</div>
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                <div>Рабочая папка: {envResults.environment.cwd}</div>
                <div>BYBIT переменные: {envResults.environment.allBybitVars.join(", ") || "Нет"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Результаты файловой системы */}
        {fileResults && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Файловая система
            </h3>

            {/* Статус файлов */}
            <div
              className={`rounded-lg p-4 border ${
                fileResults.diagnosis.envFileFound ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {fileResults.diagnosis.envFileFound ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-medium mb-1 ${
                      fileResults.diagnosis.envFileFound ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {fileResults.diagnosis.issue}
                  </p>
                  <p className={`text-sm ${fileResults.diagnosis.envFileFound ? "text-green-700" : "text-red-700"}`}>
                    {fileResults.diagnosis.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Детали файлов */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Найденные файлы:</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(fileResults.fileSystem.files).map(([fileName, info]: [string, any]) => {
                  if (fileName === "_directory_contents") return null

                  return (
                    <div key={fileName} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        {info.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{fileName}</span>
                      </div>
                      <div className="text-xs text-gray-500">{info.exists ? `${info.size} байт` : "Не найден"}</div>
                    </div>
                  )
                })}
              </div>

              {/* Содержимое .env.local */}
              {fileResults.fileSystem.envFileContent && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-2">Содержимое .env.local:</div>
                  <pre className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto">
                    {fileResults.fileSystem.envFileContent}
                  </pre>
                </div>
              )}

              {/* Содержимое папки */}
              {fileResults.fileSystem.files._directory_contents && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-2">Содержимое папки:</div>
                  <div className="text-xs font-mono">
                    {Array.isArray(fileResults.fileSystem.files._directory_contents)
                      ? fileResults.fileSystem.files._directory_contents.join(", ")
                      : fileResults.fileSystem.files._directory_contents}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Инструкции по исправлению */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🔧 Точные инструкции по исправлению:</h4>

          {envResults && !envResults.diagnosis.keysFound && (
            <div className="space-y-3 text-sm text-blue-800">
              <div className="bg-blue-100 p-3 rounded">
                <p className="font-medium mb-2">Проблема: API ключи не найдены в переменных окружения</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Найдите папку с файлом <code>package.json</code>
                  </li>
                  <li>
                    В той же папке создайте файл <code>.env.local</code>
                  </li>
                  <li>Добавьте в файл ваши реальные API ключи</li>
                  <li>Сохраните файл</li>
                  <li>Полностью перезапустите сервер</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyEnvTemplate}>
                  <Copy className="h-3 w-3 mr-1" />
                  Копировать шаблон .env.local
                </Button>
                <Button size="sm" variant="outline" onClick={copyInstructions}>
                  <FileText className="h-3 w-3 mr-1" />
                  Копировать инструкцию
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Следующие шаги */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">📋 Что делать дальше:</h4>
          <ol className="list-decimal list-inside space-y-1 text-yellow-800 text-sm">
            <li>Запустите детальную диагностику выше</li>
            <li>Изучите результаты проверки файлов</li>
            <li>Создайте или исправьте файл .env.local</li>
            <li>
              Перезапустите сервер командой: <code>npm run dev</code>
            </li>
            <li>Обновите эту страницу и запустите диагностику снова</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
