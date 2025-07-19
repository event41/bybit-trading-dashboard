// Альтернативная реализация Bybit API с другим алгоритмом подписи

const API_KEY = process.env.BYBIT_API_KEY || "nBvwdEqz4WgGCQIQBR"
const API_SECRET = process.env.BYBIT_API_SECRET || "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN"

// Альтернативный алгоритм подписи (как в официальных примерах)
function createAlternativeSignature(timestamp: string, params: Record<string, any>): string {
  if (typeof window !== "undefined") {
    return "browser_mock_signature"
  }

  try {
    const crypto = require("crypto")

    // Сортируем параметры по ключам
    const sortedKeys = Object.keys(params).sort()

    // Создаем строку параметров
    let paramString = ""
    for (const key of sortedKeys) {
      if (paramString) paramString += "&"
      paramString += `${key}=${params[key]}`
    }

    // Формат для подписи: timestamp + apiKey + recvWindow + paramString
    const recvWindow = "5000"
    const message = timestamp + API_KEY + recvWindow + paramString

    console.log("🔐 Альтернативная подпись:")
    console.log("- message:", message)

    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")
    console.log("- signature:", signature.substring(0, 16) + "...")

    return signature
  } catch (error) {
    console.error("❌ Ошибка альтернативной подписи:", error)
    return "error_signature"
  }
}

// Альтернативная функция запроса
export async function makeAlternativeRequest(endpoint: string, params: Record<string, any> = {}) {
  console.log(`🌐 АЛЬТЕРНАТИВНЫЙ запрос к Bybit: ${endpoint}`)

  try {
    const timestamp = Date.now().toString()
    const signature = createAlternativeSignature(timestamp, params)

    const queryString = new URLSearchParams(params).toString()

    const headers = {
      "X-BAPI-API-KEY": API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": "5000",
      "Content-Type": "application/json",
    }

    const url = `https://api.bybit.com${endpoint}?${queryString}`
    console.log("🔗 Альтернативный URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data = await response.json()
    console.log("📊 Альтернативный ответ:", data)

    if (data.retCode === 0) {
      console.log("✅ Альтернативный метод РАБОТАЕТ!")
      return data.result
    } else {
      console.error("❌ Альтернативный метод тоже не работает:", data.retMsg)
      return null
    }
  } catch (error) {
    console.error("❌ Ошибка альтернативного запроса:", error)
    return null
  }
}

// Тест альтернативного метода
export async function testAlternativeMethod() {
  console.log("🧪 === ТЕСТИРУЕМ АЛЬТЕРНАТИВНЫЙ МЕТОД ===")

  const result = await makeAlternativeRequest("/v5/account/wallet-balance", {
    accountType: "UNIFIED",
  })

  return result !== null
}
