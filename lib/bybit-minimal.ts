// МИНИМАЛЬНЫЙ тест для диагностики проблемы с подписью

const API_KEY = "nBvwdEqz4WgGCQIQBR"
const API_SECRET = "NY3exgnwUQZtO14ysRUepZSjRGJfpKNmikBXN"

// Самый простой тест подписи
export async function minimalSignatureTest() {
  if (typeof window !== "undefined") {
    console.log("❌ Тест подписи работает только на сервере")
    return false
  }

  try {
    const crypto = require("crypto")

    // Тестовые данные
    const timestamp = "1672531200000"
    const recvWindow = "5000"
    const queryString = "accountType=UNIFIED"

    // Создаем сообщение для подписи
    const message = timestamp + API_KEY + recvWindow + queryString
    console.log("🔐 Тестовое сообщение:", message)

    // Создаем подпись
    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")
    console.log("🔐 Тестовая подпись:", signature)

    // Ожидаемая подпись (если алгоритм правильный)
    // Это нужно сравнить с официальными примерами Bybit

    return true
  } catch (error) {
    console.error("❌ Ошибка минимального теста:", error)
    return false
  }
}

// Тест с реальным запросом но упрощенными параметрами
export async function simpleApiTest() {
  console.log("🧪 === ПРОСТОЙ ТЕСТ API ===")

  try {
    const crypto = require("crypto")

    const timestamp = Date.now().toString()
    const recvWindow = "5000"
    const queryString = "accountType=UNIFIED"

    // Создаем подпись
    const message = timestamp + API_KEY + recvWindow + queryString
    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex")

    console.log("📝 Параметры запроса:")
    console.log("- timestamp:", timestamp)
    console.log("- message:", message)
    console.log("- signature:", signature)

    // Заголовки
    const headers = {
      "X-BAPI-API-KEY": API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    }

    const url = `https://api.bybit.com/v5/account/wallet-balance?${queryString}`
    console.log("🔗 URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data = await response.json()
    console.log("📊 Ответ:", data)

    if (data.retCode === 0) {
      console.log("✅ ПРОСТОЙ ТЕСТ ПРОШЕЛ!")
      return { success: true, data }
    } else {
      console.log("❌ ПРОСТОЙ ТЕСТ НЕ ПРОШЕЛ:", data.retMsg)
      return { success: false, error: data.retMsg, data }
    }
  } catch (error) {
    console.error("❌ Ошибка простого теста:", error)
    return { success: false, error: error?.toString() }
  }
}
