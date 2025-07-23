// ИСПРАВЛЕННАЯ реализация БЕЗ демо режима - только реальные данные

const API_KEY = process.env.BYBIT_API_KEY || ""
const API_SECRET = process.env.BYBIT_API_SECRET || ""

console.log("🔍 === ПРОВЕРКА API КЛЮЧЕЙ (БЕЗ ДЕМО) ===")
console.log(
  "- process.env.BYBIT_API_KEY:",
  process.env.BYBIT_API_KEY ? `${process.env.BYBIT_API_KEY.substring(0, 8)}...` : "ОТСУТСТВУЕТ",
)
console.log(
  "- process.env.BYBIT_API_SECRET:",
  process.env.BYBIT_API_SECRET ? `${process.env.BYBIT_API_SECRET.substring(0, 8)}...` : "ОТСУТСТВУЕТ",
)

// ПРАВИЛЬНАЯ функция создания подписи
function createCorrectSignature(timestamp: string, apiKey: string, recvWindow: string, queryString: string): string {
  if (typeof window !== "undefined") {
    throw new Error("Подпись может создаваться только на сервере")
  }

  try {
    const crypto = require("crypto")
    const message = timestamp + apiKey + recvWindow + queryString

    console.log("🔐 Создание подписи:")
    console.log("  - timestamp:", timestamp)
    console.log("  - apiKey:", apiKey.substring(0, 8) + "...")
    console.log("  - recvWindow:", recvWindow)
    console.log("  - queryString:", queryString)
    console.log("  - message:", message)

    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")
    console.log("  - signature:", signature)

    return signature
  } catch (error) {
    console.error("❌ Ошибка создания подписи:", error)
    throw error
  }
}

// Проверка валидности API ключей - БЕЗ демо режима
function validateApiKeys(): { valid: boolean; message: string } {
  console.log("🔍 Валидация API ключей (строгая проверка):")
  console.log("- API_KEY длина:", API_KEY?.length || 0)
  console.log("- API_SECRET длина:", API_SECRET?.length || 0)

  if (!API_KEY || !API_SECRET) {
    console.log("❌ API ключи отсутствуют")
    return {
      valid: false,
      message: "API ключи не настроены - создайте файл .env.local с реальными ключами",
    }
  }

  if (API_KEY.length < 10 || API_SECRET.length < 20) {
    console.log("❌ API ключи слишком короткие")
    return {
      valid: false,
      message: "API ключи слишком короткие - проверьте правильность",
    }
  }

  // Проверяем, что это НЕ тестовые ключи
  if (API_KEY === "nBvwdEqz4WgGCQIQBR" || API_SECRET === "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN") {
    console.log("❌ Обнаружены тестовые ключи - они не работают!")
    return {
      valid: false,
      message: "Используются тестовые ключи - замените их на реальные ключи с Bybit",
    }
  }

  // Проверяем, что это не placeholder'ы
  if (
    API_KEY.includes("ваш_") ||
    API_SECRET.includes("ваш_") ||
    API_KEY.includes("your_") ||
    API_SECRET.includes("your_")
  ) {
    console.log("❌ Обнаружены placeholder'ы вместо реальных ключей")
    return {
      valid: false,
      message: "В .env.local используются placeholder'ы - замените их на реальные ключи",
    }
  }

  console.log("✅ API ключи выглядят валидными")
  return { valid: true, message: "API ключи валидны" }
}

// Основная функция для API запросов - ТОЛЬКО реальные запросы
async function makeBybitRequest(endpoint: string, params: Record<string, any> = {}) {
  console.log(`\n🌐 === РЕАЛЬНЫЙ ЗАПРОС К BYBIT API ===`)
  console.log("📍 Endpoint:", endpoint)
  console.log("📝 Params:", params)

  // Строгая проверка API ключей
  const keyValidation = validateApiKeys()
  if (!keyValidation.valid) {
    console.log("❌", keyValidation.message)
    throw new Error(keyValidation.message)
  }

  try {
    const timestamp = Date.now().toString()
    const recvWindow = "5000"

    const queryString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&")

    console.log("🔗 Query string:", queryString)

    const signature = createCorrectSignature(timestamp, API_KEY, recvWindow, queryString)

    const headers = {
      "X-BAPI-API-KEY": API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    }

    const url = `https://api.bybit.com${endpoint}${queryString ? `?${queryString}` : ""}`
    console.log("🔗 URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    console.log("📥 HTTP Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP Error:", response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("📊 Response:")
    console.log("  - retCode:", data.retCode)
    console.log("  - retMsg:", data.retMsg)

    if (data.retCode === 0) {
      console.log("✅ Успешный запрос!")
      return { success: true, error: null, data: data.result }
    } else {
      console.error("❌ Bybit API Error:", data.retMsg)
      throw new Error(`Bybit API Error: ${data.retMsg}`)
    }
  } catch (error) {
    console.error("❌ Критическая ошибка запроса:", error)
    throw error
  }
}

// Получение баланса - ТОЛЬКО реальные данные
export async function getBybitBalance() {
  console.log("\n💰 === ПОЛУЧЕНИЕ РЕАЛЬНОГО БАЛАНСА ===")

  try {
    const result = await makeBybitRequest("/v5/account/wallet-balance", {
      accountType: "UNIFIED",
    })

    console.log("✅ Баланс получен с реального API")
    return result.data
  } catch (error) {
    console.error("❌ Ошибка получения баланса:", error)
    throw error
  }
}

// Получение позиций - ИСПРАВЛЕНО с правильными параметрами
export async function getBybitPositions() {
  console.log("\n📊 === ПОЛУЧЕНИЕ РЕАЛЬНЫХ ПОЗИЦИЙ ===")

  try {
    // Сначала получаем все позиции без фильтра по символу
    const result = await makeBybitRequest("/v5/position/list", {
      category: "linear",
      settleCoin: "USDT", // Добавляем обязательный параметр
    })

    const positions = result.data?.list || []
    console.log(`✅ Позиции получены с реального API: ${positions.length} шт.`)

    // Фильтруем только открытые позиции
    const openPositions = positions.filter((pos: any) => pos.size && Number.parseFloat(pos.size) > 0)

    console.log(`📊 Открытых позиций: ${openPositions.length} из ${positions.length}`)
    return openPositions
  } catch (error) {
    console.error("❌ Ошибка получения позиций:", error)
    // Возвращаем пустой массив вместо выброса ошибки
    return []
  }
}

// Получение сделок - ТОЛЬКО реальные данные
export async function getBybitTrades() {
  console.log("\n📈 === ПОЛУЧЕНИЕ РЕАЛЬНЫХ СДЕЛОК ===")

  try {
    const result = await makeBybitRequest("/v5/execution/list", {
      category: "linear",
      limit: 50,
    })

    const trades = result.data?.list || []
    console.log(`✅ Сделки получены с реального API: ${trades.length} шт.`)
    return trades
  } catch (error) {
    console.error("❌ Ошибка получения сделок:", error)
    return []
  }
}

// Тест подключения - ТОЛЬКО реальное подключение
export async function testBybitConnection() {
  console.log("\n🔍 === ТЕСТ РЕАЛЬНОГО ПОДКЛЮЧЕНИЯ ===")

  // Проверяем API ключи
  const keyValidation = validateApiKeys()
  if (!keyValidation.valid) {
    return {
      success: false,
      message: `❌ ${keyValidation.message}`,
      details: {
        apiKey: !!API_KEY,
        apiSecret: !!API_SECRET,
        keyLength: API_KEY.length,
        secretLength: API_SECRET.length,
        validation: keyValidation.message,
      },
    }
  }

  try {
    // Тестируем публичный API
    console.log("1️⃣ Тест публичного API...")
    const publicResponse = await fetch("https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT")

    if (!publicResponse.ok) {
      throw new Error(`Public API failed: ${publicResponse.status}`)
    }

    const publicData = await publicResponse.json()
    if (publicData.retCode !== 0) {
      throw new Error(`Public API error: ${publicData.retMsg}`)
    }

    console.log("✅ Публичный API работает")

    // Тестируем приватный API
    console.log("2️⃣ Тест приватного API...")
    const balanceResult = await makeBybitRequest("/v5/account/wallet-balance", {
      accountType: "UNIFIED",
    })

    return {
      success: true,
      message: "✅ Подключение к Bybit API успешно!",
      details: {
        publicApi: "OK",
        privateApi: "OK",
        balance: balanceResult.data,
      },
    }
  } catch (error) {
    console.error("❌ Ошибка теста подключения:", error)
    return {
      success: false,
      message: `❌ Ошибка: ${error}`,
      details: { error: error?.toString() },
    }
  }
}

// Статус API - строгая проверка
export function getApiStatus() {
  const keyValidation = validateApiKeys()

  return {
    hasKeys: !!(API_KEY && API_SECRET),
    apiKey: !!API_KEY,
    apiSecret: !!API_SECRET,
    keyPreview: API_KEY ? `${API_KEY.substring(0, 8)}...` : null,
    secretPreview: API_SECRET ? `${API_SECRET.substring(0, 8)}...` : null,
    keyLength: API_KEY.length,
    secretLength: API_SECRET.length,
    source: process.env.BYBIT_API_KEY ? "environment" : "missing",
    validation: keyValidation,
    isDemo: false, // Демо режим полностью отключен
  }
}

// Диагностика окружения
export function diagnoseEnvironment() {
  return {
    nodeEnv: process.env.NODE_ENV,
    bybitVars: Object.keys(process.env).filter((key) => key.includes("BYBIT")),
    allEnvKeys: Object.keys(process.env).length,
    hasEnvFile: process.env.BYBIT_API_KEY ? "YES" : "NO",
    demoMode: false, // Демо режим отключен
  }
}
