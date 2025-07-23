"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"

interface CriticalErrorProps {
  title: string
  message: string
  details?: any
}

export function CriticalError({ title, message, details }: CriticalErrorProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-800 dark:text-red-200">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Основное сообщение */}
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-medium">{message}</p>
          </div>

          {/* Пошаговое решение */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🔧 Как исправить:</h3>

            {/* Шаг 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">
                <Badge variant="outline" className="mr-2">
                  1
                </Badge>
                Получите API ключи на Bybit
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  • Войдите на <strong>bybit.com</strong>
                </p>
                <p>
                  • Перейдите в <strong>Account & Security → API Management</strong>
                </p>
                <p>
                  • Создайте новые ключи с разрешениями <strong>Read-Write</strong>
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                <a href="https://www.bybit.com/app/user/api-management" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть Bybit API
                </a>
              </Button>
            </div>

            {/* Шаг 2 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">
                <Badge variant="outline" className="mr-2">
                  2
                </Badge>
                Создайте файл .env.local
              </h4>
              <div className="text-sm text-muted-foreground mb-2">В корневой папке проекта (рядом с package.json):</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">
                <div className="text-green-600 dark:text-green-400"># Файл: .env.local</div>
                <div>BYBIT_API_KEY=ваш_реальный_api_key</div>
                <div>BYBIT_API_SECRET=ваш_реальный_secret_key</div>
              </div>
              <div className="text-xs text-amber-600 mt-1">⚠️ Замените на реальные ключи с Bybit!</div>
            </div>

            {/* Шаг 3 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2">
                <Badge variant="outline" className="mr-2">
                  3
                </Badge>
                Перезапустите сервер
              </h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">
                <div># Остановите сервер (Ctrl+C) и запустите заново:</div>
                <div>npm run dev</div>
              </div>
            </div>

            {/* Шаг 4 */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold mb-2">
                <Badge variant="outline" className="mr-2">
                  4
                </Badge>
                Обновите страницу
              </h4>
              <Button onClick={handleRefresh} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить страницу
              </Button>
            </div>
          </div>

          {/* Детали ошибки */}
          {details && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">🔍 Детали ошибки:</h4>
              <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(details, null, 2)}</pre>
            </div>
          )}

          {/* Структура проекта */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📁 Правильная структура:</h4>
            <div className="font-mono text-sm text-blue-700 dark:text-blue-300">
              <div>my-project/</div>
              <div>├── .env.local ← Создайте здесь</div>
              <div>├── package.json</div>
              <div>├── next.config.js</div>
              <div>└── app/</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
