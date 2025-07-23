"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, FileText, AlertTriangle, Copy } from "lucide-react"

export function SetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envTemplate = `# Файл .env.local - создайте в корне проекта
BYBIT_API_KEY=ваш_реальный_api_key_здесь
BYBIT_API_SECRET=ваш_реальный_secret_key_здесь

# Дополнительные настройки (опционально)
NODE_ENV=development
NEXT_PUBLIC_ENABLE_WEBSOCKET=true`

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="h-5 w-5" />📋 Пошаговая настройка Bybit API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Шаг 1: Получение API ключей */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Получите API ключи на Bybit</h3>
            </div>

            <div className="ml-11 space-y-3">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Инструкция:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Войдите в свой аккаунт на bybit.com</li>
                  <li>Перейдите в Account & Security → API Management</li>
                  <li>Нажмите "Create New Key"</li>
                  <li>Выберите тип: "System-generated API Keys"</li>
                  <li>Установите разрешения: Read-Write (для торговли) или Read-Only (только просмотр)</li>
                  <li>Скопируйте API Key и Secret Key</li>
                </ol>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a href="https://www.bybit.com/app/user/api-management" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть Bybit API Management
                </a>
              </Button>
            </div>
          </div>

          {/* Шаг 2: Создание файла .env.local */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-green-900">Создайте файл .env.local</h3>
            </div>

            <div className="ml-11 space-y-3">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Расположение файла:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  <div className="text-gray-600"># Структура проекта:</div>
                  <div>my-trading-dashboard/</div>
                  <div>├── .env.local ← Создайте здесь</div>
                  <div>├── package.json</div>
                  <div>├── next.config.js</div>
                  <div>└── app/</div>
                </div>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Содержимое файла .env.local:</h4>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(envTemplate, 2)} className="h-7">
                    {copiedStep === 2 ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedStep === 2 ? "Скопировано!" : "Копировать"}
                  </Button>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                  <div className="text-gray-500"># Файл .env.local - создайте в корне проекта</div>
                  <div>BYBIT_API_KEY=ваш_реальный_api_key_здесь</div>
                  <div>BYBIT_API_SECRET=ваш_реальный_secret_key_здесь</div>
                  <div></div>
                  <div className="text-gray-500"># Дополнительные настройки (опционально)</div>
                  <div>NODE_ENV=development</div>
                  <div>NEXT_PUBLIC_ENABLE_WEBSOCKET=true</div>
                </div>
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  <strong>Важно:</strong> Замените "ваш_реальный_api_key_здесь" на настоящие ключи с Bybit!
                </div>
              </div>
            </div>
          </div>

          {/* Шаг 3: Перезапуск сервера */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Перезапустите сервер разработки</h3>
            </div>

            <div className="ml-11 space-y-3">
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Команды для терминала:</h4>
                <div className="space-y-2">
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    <div className="text-gray-500"># 1. Остановите текущий сервер (Ctrl+C)</div>
                    <div className="text-gray-500"># 2. Запустите заново:</div>
                    <div>npm run dev</div>
                    <div className="text-gray-500"># или</div>
                    <div>yarn dev</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("npm run dev", 3)} className="h-7">
                    {copiedStep === 3 ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedStep === 3 ? "Скопировано!" : "Копировать команду"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Шаг 4: Проверка */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-orange-900">Проверьте результат</h3>
            </div>

            <div className="ml-11">
              <div className="bg-white border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">После перезапуска сервера:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                  <li>Обновите страницу в браузере</li>
                  <li>Система должна показать "✅ Подключено к реальному Bybit API"</li>
                  <li>Вы увидите реальные данные вашего аккаунта</li>
                  <li>Если есть ошибки - проверьте консоль браузера (F12)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Важные замечания */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">⚠️ Важные замечания</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Безопасность:</strong> Файл .env.local автоматически игнорируется Git'ом и не попадет в
                репозиторий
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Права API:</strong> Для просмотра данных достаточно Read-Only, для торговли нужен Read-Write
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Тестовая сеть:</strong> Для тестирования используйте testnet.bybit.com (отдельные ключи)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Ограничения:</strong> API ключи имеют лимиты запросов - не делайте слишком частые обновления
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Устранение проблем */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">🔧 Устранение проблем</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-900 mb-2">Проблема: "API ключи не найдены"</h4>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Проверьте, что файл .env.local находится в корне проекта</li>
                <li>Убедитесь, что нет пробелов вокруг знака "="</li>
                <li>Перезапустите сервер после создания файла</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-red-900 mb-2">Проблема: "Invalid API signature"</h4>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Проверьте правильность скопированных ключей</li>
                <li>Убедитесь, что ключи активны в настройках Bybit</li>
                <li>Проверьте права доступа API ключей</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-red-900 mb-2">Проблема: "Rate limit exceeded"</h4>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Подождите несколько минут перед повторными запросами</li>
                <li>Уменьшите частоту автообновления</li>
                <li>Проверьте лимиты в настройках API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
