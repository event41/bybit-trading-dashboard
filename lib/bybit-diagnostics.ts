// ПОЛНАЯ ДИАГНОСТИКА BYBIT API - Новая система

export interface DiagnosticResult {
  step: string
  success: boolean
  message: string
  details?: any
  error?: string
}

export interface FullDiagnostic {
  timestamp: string
  environment: any
  apiKeys: any
  publicApi: DiagnosticResult
  signature: DiagnosticResult
  privateApi: DiagnosticResult
  summary: {
    success: boolean
    mainIssue: string
    recommendation: string
  }
}

// Получение переменных окружения
function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    platform: typeof window !== "undefined" ? "browser" : "server",
    bybitApiKey: process.env.BYBIT_API_KEY ? `${process.env.BYBIT_API_KEY.substring(0, 8)}...` : "НЕТ",
    bybitApiSecret: process.env.BYBIT_API_SECRET ? `${process.env.BYBIT_API_SECRET.substring(0, 8)}...` : "НЕТ",
    allEnvVars: typeof process !== "undefined" ? Object.keys(process.env).filter((key) => key.includes("BYBIT")) : [],
  }
}

// Проверка API ключей
function validateApiKeys() {
  const apiKey = process.env.BYBIT_API_KEY
  const apiSecret = process.env.BYBIT_API_SECRET

  return {
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : null,
    apiSecretPreview: apiSecret ? `${apiSecret.substring(0, 10)}...` : null,
    isTestKeys: apiKey === "nBvwdEqz4WgGCQIQBR" && apiSecret === "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN",
    keysValid: !!(apiKey && apiSecret && apiKey.length > 10 && apiSecret.length > 20),
  }
}

// Тест публичного API (без аутентификации)
async function testPublicApi(): Promise<DiagnosticResult> {
  try {
    console.log("🌐 Тестируем публичный API Bybit...")

    const response = await fetch("https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("📥 Публичный API - HTTP статус:", response.status)

    if (!response.ok) {
      return {
        step: "public_api",
        success: false,
        message: `HTTP ошибка: ${response.status}`,
        error: `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    console.log("📊 Публичный API - ответ:", data)

    if (data.retCode === 0) {
      return {
        step: "public_api",
        success: true,
        message: "Публичный API работает корректно",
        details: {
          symbol: data.result?.list?.[0]?.symbol,
          price: data.result?.list?.[0]?.lastPrice,
        },
      }
    } else {
      return {
        step: "public_api",
        success: false,
        message: `Bybit API ошибка: ${data.retMsg}`,
        error: data.retMsg,
        details: data,
      }
    }
  } catch (error) {
    console.error("❌ Ошибка публичного API:", error)
    return {
      step: "public_api",
      success: false,
      message: `Сетевая ошибка: ${error}`,
      error: error?.toString(),
    }
  }
}

// Тест создания подписи
async function testSignature(): Promise<DiagnosticResult> {
  if (typeof window !== "undefined") {
    return {
      step: "signature",
      success: false,
      message: "Тест подписи доступен только на сервере",
      error: "Browser environment",
    }
  }

  try {
    const crypto = require("crypto")
    const apiKey = process.env.BYBIT_API_KEY
    const apiSecret = process.env.BYBIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return {
        step: "signature",
        success: false,
        message: "API ключи не найдены",
        error: "Missing API keys",
      }
    }

    // Тестовые параметры
    const timestamp = "1672531200000" // Фиксированное время для тестирования
    const recvWindow = "5000"
    const queryString = "accountType=UNIFIED"

    // Создаем подпись по алгоритму Bybit V5
    const message = timestamp + apiKey + recvWindow + queryString
    const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex")

    console.log("🔐 Тест подписи:")
    console.log("  - message:", message)
    console.log("  - signature:", signature)

    // Проверяем, что подпись создается корректно
    if (signature && signature.length === 64) {
      return {
        step: "signature",
        success: true,
        message: "Подпись создается корректно",
        details: {
          messageLength: message.length,
          signatureLength: signature.length,
          signaturePreview: signature.substring(0, 16) + "...",
        },
      }
    } else {
      return {
        step: "signature",
        success: false,
        message: "Некорректная подпись",
        error: "Invalid signature format",
        details: { signature },
      }
    }
  } catch (error) {
    console.error("❌ Ошибка создания подписи:", error)
    return {
      step: "signature",
      success: false,
      message: `Ошибка создания подписи: ${error}`,
      error: error?.toString(),
    }
  }
}

// Тест приватного API
async function testPrivateApi(): Promise<DiagnosticResult> {
  if (typeof window !== "undefined") {
    return {
      step: "private_api",
      success: false,
      message: "Приватный API доступен только на сервере",
      error: "Browser environment",
    }
  }

  try {
    const crypto = require("crypto")
    const apiKey = process.env.BYBIT_API_KEY
    const apiSecret = process.env.BYBIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return {
        step: "private_api",
        success: false,
        message: "API ключи не найдены для приватного API",
        error: "Missing API keys",
      }
    }

    // Параметры запроса
    const timestamp = Date.now().toString()
    const recvWindow = "5000"
    const queryString = "accountType=UNIFIED"

    // Создаем подпись
    const message = timestamp + apiKey + recvWindow + queryString
    const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex")

    // Заголовки
    const headers = {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    }

    const url = `https://api.bybit.com/v5/account/wallet-balance?${queryString}`

    console.log("🔒 Тестируем приватный API:")
    console.log("  - URL:", url)
    console.log("  - Headers:", {
      ...headers,
      "X-BAPI-API-KEY": apiKey.substring(0, 8) + "...",
      "X-BAPI-SIGN": signature.substring(0, 16) + "...",
    })

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    console.log("📥 Приватный API - HTTP статус:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP ошибка:", errorText)

      return {
        step: "private_api",
        success: false,
        message: `HTTP ошибка ${response.status}`,
        error: errorText,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      }
    }

    const data = await response.json()
    console.log("📊 Приватный API - ответ:", data)

    if (data.retCode === 0) {
      return {
        step: "private_api",
        success: true,
        message: "Приватный API работает корректно!",
        details: {
          accountType: data.result?.list?.[0]?.accountType,
          coinsCount: data.result?.list?.[0]?.coin?.length || 0,
          hasBalance: data.result?.list?.[0]?.coin?.some((c: any) => Number.parseFloat(c.walletBalance) > 0),
        },
      }
    } else {
      return {
        step: "private_api",
        success: false,
        message: `Bybit API ошибка: ${data.retMsg}`,
        error: data.retMsg,
        details: {
          retCode: data.retCode,
          retMsg: data.retMsg,
        },
      }
    }
  } catch (error) {
    console.error("❌ Ошибка приватного API:", error)
    return {
      step: "private_api",
      success: false,
      message: `Критическая ошибка: ${error}`,
      error: error?.toString(),
    }
  }
}

// Полная диагностика
export async function runFullDiagnostic(): Promise<FullDiagnostic> {
  console.log("🔍 === ЗАПУСК ПОЛНОЙ ДИАГНОСТИКИ BYBIT API ===")

  const timestamp = new Date().toISOString()
  const environment = getEnvironmentInfo()
  const apiKeys = validateApiKeys()

  console.log("📋 Информация об окружении:", environment)
  console.log("🔑 Информация об API ключах:", apiKeys)

  // Выполняем тесты последовательно
  const publicApi = await testPublicApi()
  const signature = await testSignature()
  const privateApi = await testPrivateApi()

  // Анализируем результаты
  let mainIssue = "Неизвестная проблема"
  let recommendation = "Обратитесь к разработчику"

  if (!publicApi.success) {
    mainIssue = "Проблема с подключением к Bybit"
    recommendation = "Проверьте интернет-соединение и доступность api.bybit.com"
  } else if (!apiKeys.keysValid) {
    mainIssue = "Некорректные API ключи"
    recommendation = "Создайте новые API ключи на bybit.com и добавьте их в .env.local"
  } else if (!signature.success) {
    mainIssue = "Проблема с созданием подписи"
    recommendation = "Проверьте правильность API Secret"
  } else if (!privateApi.success) {
    mainIssue = "Проблема с аутентификацией"
    recommendation = "Проверьте права доступа API ключей и их активность"
  } else {
    mainIssue = "Все работает корректно!"
    recommendation = "API настроен правильно"
  }

  const result: FullDiagnostic = {
    timestamp,
    environment,
    apiKeys,
    publicApi,
    signature,
    privateApi,
    summary: {
      success: publicApi.success && signature.success && privateApi.success,
      mainIssue,
      recommendation,
    },
  }

  console.log("🎯 === РЕЗУЛЬТАТЫ ДИАГНОСТИКИ ===")
  console.log("✅ Публичный API:", publicApi.success ? "OK" : "FAIL")
  console.log("✅ Подпись:", signature.success ? "OK" : "FAIL")
  console.log("✅ Приватный API:", privateApi.success ? "OK" : "FAIL")
  console.log("🔍 Основная проблема:", mainIssue)
  console.log("💡 Рекомендация:", recommendation)

  return result
}

// Быстрая диагностика для UI
export async function quickDiagnostic() {
  const environment = getEnvironmentInfo()
  const apiKeys = validateApiKeys()
  const publicApi = await testPublicApi()

  return {
    environment: environment.platform,
    hasKeys: apiKeys.keysValid,
    publicApiWorks: publicApi.success,
    canRunFullTest: environment.platform === "server",
    recommendation: !apiKeys.keysValid
      ? "Настройте API ключи"
      : !publicApi.success
        ? "Проблема с подключением к Bybit"
        : "Запустите полную диагностику",
  }
}
