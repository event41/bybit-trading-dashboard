// НОВАЯ ПРАВИЛЬНАЯ реализация Bybit API V5

const API_KEY = process.env.BYBIT_API_KEY || "nBvwdEqz4WgGCQIQBR"
const API_SECRET = process.env.BYBIT_API_SECRET || "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN"

console.log("🔑 Используем ключи:")
console.log("- API_KEY:", API_KEY ? `${API_KEY.substring(0, 10)}...` : "НЕТ")
console.log("- API_SECRET:", API_SECRET ? `${API_SECRET.substring(0, 10)}...` : "НЕТ")

// ПРАВИЛЬНЫЙ алгоритм подписи для Bybit V5 API
function createCorrectSignature(timestamp: string, apiKey: string, recvWindow: string, queryString: string): string {
  if (typeof window !== "undefined") {
    return "browser_mock_signature"
  }

  try {
    const crypto = require("crypto")

    // ВАЖНО: Правильный порядок для Bybit V5 API
    // Формат: timestamp + apiKey + recvWindow + queryString
    const message = timestamp + apiKey + recvWindow + queryString

    console.log("🔐 Создание подписи:")
    console.log("- timestamp:", timestamp)
    console.log("- apiKey:", apiKey.substring(0, 8) + "...")
    console.log("- recvWindow:", recvWindow)
    console.log("- queryString:", queryString)
    console.log("- message:", message)

    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")
    console.log("- signature:", signature)

    return signature
  } catch (error) {
    console.error("❌ Ошибка создания подписи:", error)
    return "error_signature"
  }
}

// Новая функция для запросов с правильной подписью
async function makeCorrectRequest(endpoint: string, params: Record<string, any> = {}) {
  console.log(`🌐 === НОВЫЙ ЗАПРОС К BYBIT ===`)
  console.log("Endpoint:", endpoint)
  console.log("Params:", params)

  if (!API_KEY || !API_SECRET) {
    console.log("❌ Нет API ключей")
    return null
  }

  try {
    const timestamp = Date.now().toString()
    const recvWindow = "5000"

    // Создаем query string
    const queryString = new URLSearchParams(params).toString()
    console.log("Query string:", queryString)

    // Создаем подпись
    const signature = createCorrectSignature(timestamp, API_KEY, recvWindow, queryString)

    // Заголовки
    const headers = {
      "X-BAPI-API-KEY": API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    }

    console.log("📤 Заголовки:")
    console.log("- X-BAPI-API-KEY:", API_KEY.substring(0, 8) + "...")
    console.log("- X-BAPI-SIGN:", signature.substring(0, 16) + "...")
    console.log("- X-BAPI-TIMESTAMP:", timestamp)

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
      return null
    }

    const data = await response.json()
    console.log("📊 Response:", data)

    if (data.retCode === 0) {
      console.log("✅ Успешный запрос!")
      return data.result
    } else {
      console.error("❌ Bybit API Error:")
      console.error("- retCode:", data.retCode)
      console.error("- retMsg:", data.retMsg)
      return null
    }
  } catch (error) {
    console.error("❌ Кри��ическая ошибка:", error)
    return null
  }
}

// Тестовые функции
export async function testNewBalance() {
  console.log("💰 === ТЕСТ НОВОГО БАЛАНСА ===")
  return await makeCorrectRequest("/v5/account/wallet-balance", {
    accountType: "UNIFIED",
  })
}

export async function testNewPositions() {
  console.log("📊 === ТЕСТ НОВЫХ ПОЗИЦИЙ ===")
  return await makeCorrectRequest("/v5/position/list", {
    category: "linear",
  })
}

export async function testNewTrades() {
  console.log("📈 === ТЕСТ НОВЫХ СДЕЛОК ===")
  return await makeCorrectRequest("/v5/execution/list", {
    category: "linear",
    limit: 10,
  })
}

// Полный тест API
export async function fullApiTest() {
  console.log("🧪 === ПОЛНЫЙ ТЕСТ API ===")

  const results = {
    balance: null as any,
    positions: null as any,
    trades: null as any,
    success: false,
  }

  try {
    // Тест баланса
    console.log("1️⃣ Тестируем баланс...")
    results.balance = await testNewBalance()
    console.log("Результат баланса:", results.balance ? "✅ OK" : "❌ FAIL")

    // Тест позиций
    console.log("2️⃣ Тестируем позиции...")
    results.positions = await testNewPositions()
    console.log("Результат позиций:", results.positions ? "✅ OK" : "❌ FAIL")

    // Тест сделок
    console.log("3️⃣ Тестируем сделки...")
    results.trades = await testNewTrades()
    console.log("Результат сделок:", results.trades ? "✅ OK" : "❌ FAIL")

    // Проверяем успех
    results.success = !!(results.balance || results.positions || results.trades)

    console.log("🎯 === ИТОГИ ТЕСТА ===")
    console.log("- Баланс:", results.balance ? "✅" : "❌")
    console.log("- Позиции:", results.positions ? "✅" : "❌")
    console.log("- Сделки:", results.trades ? "✅" : "❌")
    console.log("- Общий результат:", results.success ? "✅ УСПЕХ" : "❌ ПРОВАЛ")

    return results
  } catch (error) {
    console.error("❌ Ошибка полного теста:", error)
    results.success = false
    return results
  }
}
