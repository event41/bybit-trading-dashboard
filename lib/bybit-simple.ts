// ПОЛНОСТЬЮ НОВАЯ реализация Bybit API с правильной подписью

const API_KEY = process.env.BYBIT_API_KEY || "nBvwdEqz4WgGCQIQBR"
const API_SECRET = process.env.BYBIT_API_SECRET || "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN"

console.log("🔑 === НОВАЯ ИНИЦИАЛИЗАЦИЯ BYBIT API ===")
console.log("- API_KEY длина:", API_KEY.length)
console.log("- API_SECRET длина:", API_SECRET.length)
console.log("- API_KEY начало:", API_KEY.substring(0, 10))

const hasApiKeys = !!(API_KEY && API_SECRET)

// ПРАВИЛЬНАЯ функция создания подписи для Bybit V5
function createBybitSignature(timestamp: string, queryString: string): string {
  if (typeof window !== "undefined") {
    console.log("🌐 Браузер - возвращаем mock подпись")
    return "browser_mock_signature"
  }

  try {
    console.log("🔐 === СОЗДАНИЕ ПОДПИСИ ===")
    const crypto = require("crypto")

    const recvWindow = "5000"

    // ПРАВИЛЬНЫЙ формат для Bybit V5: timestamp + apiKey + recvWindow + queryString
    const message = timestamp + API_KEY + recvWindow + queryString

    console.log("📝 Компоненты подписи:")
    console.log("  - timestamp:", timestamp)
    console.log("  - apiKey:", API_KEY.substring(0, 8) + "...")
    console.log("  - recvWindow:", recvWindow)
    console.log("  - queryString:", queryString)
    console.log("  - message:", message)

    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")
    console.log("  - signature:", signature)

    return signature
  } catch (error) {
    console.error("❌ Ошибка создания подписи:", error)
    return "error_signature"
  }
}

// НОВАЯ функция для запросов к Bybit
async function makeBybitApiRequest(endpoint: string, params: Record<string, any> = {}) {
  console.log(`\n🌐 === НОВЫЙ ЗАПРОС К BYBIT ===`)
  console.log("📍 Endpoint:", endpoint)
  console.log("📝 Параметры:", JSON.stringify(params, null, 2))

  if (!hasApiKeys) {
    console.log("❌ API ключи не настроены")
    return null
  }

  try {
    const timestamp = Date.now().toString()
    const recvWindow = "5000"

    // Создаем query string
    const queryString = new URLSearchParams(params).toString()
    console.log("🔗 Query string:", queryString)

    // Создаем подпись
    const signature = createBybitSignature(timestamp, queryString)

    // Заголовки
    const headers = {
      "X-BAPI-API-KEY": API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    }

    console.log("📤 Заголовки (скрытые ключи):")
    console.log("  - X-BAPI-API-KEY:", API_KEY.substring(0, 8) + "...")
    console.log("  - X-BAPI-SIGN:", signature.substring(0, 16) + "...")
    console.log("  - X-BAPI-TIMESTAMP:", timestamp)
    console.log("  - X-BAPI-RECV-WINDOW:", recvWindow)

    const url = `https://api.bybit.com${endpoint}${queryString ? `?${queryString}` : ""}`
    console.log("🔗 Полный URL:", url)

    console.log("📡 Отправляем запрос...")
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    console.log("📥 HTTP статус:", response.status)
    console.log("📥 HTTP статус текст:", response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP ошибка:")
      console.error("  - Статус:", response.status)
      console.error("  - Текст:", errorText)
      return null
    }

    const responseText = await response.text()
    console.log("📄 Сырой ответ (первые 300 символов):", responseText.substring(0, 300) + "...")

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Ошибка парсинга JSON:", parseError)
      console.error("❌ Сырой ответ:", responseText)
      return null
    }

    console.log("📊 Распарсенные данные:")
    console.log("  - retCode:", data.retCode)
    console.log("  - retMsg:", data.retMsg)
    console.log("  - result тип:", typeof data.result)
    console.log("  - result ключи:", data.result ? Object.keys(data.result) : "null")

    if (data.retCode === 0) {
      console.log("✅ Успешный ответ от Bybit!")
      return data.result
    } else {
      console.error("❌ Bybit API ошибка:")
      console.error("  - Код:", data.retCode)
      console.error("  - Сообщение:", data.retMsg)
      console.error("  - Полные данные:", JSON.stringify(data, null, 2))
      return null
    }
  } catch (error) {
    console.error("❌ === КРИТИЧЕСКАЯ ОШИБКА ЗАПРОСА ===")
    console.error("❌ Тип ошибки:", error.constructor.name)
    console.error("❌ Сообщение:", error.message)
    console.error("❌ Стек:", error.stack)
    return null
  }
}

// Получение баланса аккаунта
export async function getBybitBalance() {
  console.log("\n💰 === ПОЛУЧЕНИЕ БАЛАНСА ===")

  const result = await makeBybitApiRequest("/v5/account/wallet-balance", {
    accountType: "UNIFIED",
  })

  console.log("💰 Результат баланса:", result ? "Получен" : "Ошибка")
  return result
}

// Получение позиций
export async function getBybitPositions() {
  console.log("\n📊 === ПОЛУЧЕНИЕ ПОЗИЦИЙ ===")

  const result = await makeBybitApiRequest("/v5/position/list", {
    category: "linear",
  })

  console.log("📊 Результат позиций:", result ? `Получено ${result.list?.length || 0} позиций` : "Ошибка")
  return result?.list || []
}

// Получение истории сделок
export async function getBybitTrades() {
  console.log("\n📈 === ПОЛУЧЕНИЕ СДЕЛОК ===")

  const result = await makeBybitApiRequest("/v5/execution/list", {
    category: "linear",
    limit: 50,
  })

  console.log("📈 Результат сделок:", result ? `Получено ${result.list?.length || 0} сделок` : "Ошибка")
  return result?.list || []
}

// Тест подключения
export async function testBybitConnection() {
  console.log("\n🔍 === ТЕСТ ПОДКЛЮЧЕНИЯ ===")

  if (!hasApiKeys) {
    return {
      success: false,
      message: "❌ API ключи не настроены",
      details: {
        apiKey: !!API_KEY,
        apiSecret: !!API_SECRET,
        envFile: "Проверьте файл .env.local",
      },
    }
  }

  try {
    // Сначала тестируем публичный API
    console.log("1️⃣ Тестируем публичный API...")
    const publicResponse = await fetch("https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT")

    if (!publicResponse.ok) {
      throw new Error(`Public API failed: ${publicResponse.status}`)
    }

    const publicData = await publicResponse.json()
    if (publicData.retCode !== 0) {
      throw new Error(`Public API error: ${publicData.retMsg}`)
    }

    console.log("✅ Публичный API работает")

    // Теперь тестируем приватный API
    console.log("2️⃣ Тестируем приватный API...")
    const balance = await getBybitBalance()

    if (balance !== null) {
      return {
        success: true,
        message: "✅ Подключение к Bybit API успешно!",
        details: {
          publicApi: "OK",
          privateApi: "OK",
          balance: balance,
        },
      }
    } else {
      return {
        success: false,
        message: "❌ Приватный API не работает",
        details: {
          publicApi: "OK",
          privateApi: "ERROR",
        },
      }
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

// Функция для проверки настроек
export function getApiStatus() {
  return {
    hasKeys: hasApiKeys,
    apiKey: !!API_KEY,
    apiSecret: !!API_SECRET,
    keyPreview: API_KEY ? `${API_KEY.substring(0, 8)}...` : null,
    secretPreview: API_SECRET ? `${API_SECRET.substring(0, 8)}...` : null,
    keyLength: API_KEY.length,
    secretLength: API_SECRET.length,
    source: process.env.BYBIT_API_KEY ? "env file" : "hardcoded",
  }
}

// Функция для диагностики
export function diagnoseEnvironment() {
  return {
    nodeEnv: process.env.NODE_ENV,
    bybitVars: Object.keys(process.env).filter((key) => key.includes("BYBIT")),
    allEnvKeys: Object.keys(process.env).length,
    hasEnvFile: process.env.BYBIT_API_KEY ? "YES" : "NO",
  }
}

// Экспортируем дополнительную функцию для прямого тестирования
export async function directApiTest() {
  console.log("\n🧪 === ПРЯМОЙ ТЕСТ API ===")

  const results = {
    balance: null as any,
    positions: null as any,
    trades: null as any,
    errors: [] as string[],
  }

  try {
    console.log("1️⃣ Тестируем баланс...")
    results.balance = await getBybitBalance()
    if (!results.balance) results.errors.push("balance")
  } catch (error) {
    console.error("❌ Ошибка баланса:", error)
    results.errors.push(`balance: ${error}`)
  }

  try {
    console.log("2️⃣ Тестируем позиции...")
    results.positions = await getBybitPositions()
    if (!results.positions || results.positions.length === 0) results.errors.push("positions")
  } catch (error) {
    console.error("❌ Ошибка позиций:", error)
    results.errors.push(`positions: ${error}`)
  }

  try {
    console.log("3️⃣ Тестируем сделки...")
    results.trades = await getBybitTrades()
    if (!results.trades || results.trades.length === 0) results.errors.push("trades")
  } catch (error) {
    console.error("❌ Ошибка сделок:", error)
    results.errors.push(`trades: ${error}`)
  }

  console.log("\n📋 === ИТОГИ ПРЯМОГО ТЕСТА ===")
  console.log("✅ Баланс:", results.balance ? "OK" : "FAIL")
  console.log("✅ Позиции:", results.positions ? "OK" : "FAIL")
  console.log("✅ Сделки:", results.trades ? "OK" : "FAIL")
  console.log("❌ Ошибки:", results.errors)

  return results
}
