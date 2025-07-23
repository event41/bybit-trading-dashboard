import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 === ПРОВЕРКА СТАТУСА СИСТЕМЫ ===")

    // Проверяем переменные окружения
    const apiKey = process.env.BYBIT_API_KEY
    const apiSecret = process.env.BYBIT_API_SECRET

    console.log("- API Key найден:", !!apiKey)
    console.log("- API Secret найден:", !!apiSecret)
    console.log("- API Key длина:", apiKey?.length || 0)
    console.log("- API Secret длина:", apiSecret?.length || 0)

    // Определяем статус конфигурации
    const keysExist = !!(apiKey && apiSecret)
    const keysValid = keysExist && apiKey.length > 10 && apiSecret.length > 20
    const keysConfigured = keysValid && !apiKey.includes("ваш_") && !apiSecret.includes("ваш_")

    let issue = "Неизвестная проблема"
    let solution = "Проверьте конфигурацию"

    if (!keysExist) {
      issue = "API ключи не найдены"
      solution = "Создайте файл .env.local с реальными API ключами Bybit"
    } else if (!keysValid) {
      issue = "API ключи слишком короткие"
      solution = "Проверьте правильность скопированных ключей"
    } else if (!keysConfigured) {
      issue = "Используются placeholder'ы вместо реальных ключей"
      solution = "Замените 'ваш_реальный_api_key' на настоящие ключи с Bybit"
    } else {
      issue = "API ключи настроены корректно"
      solution = "Система готова к работе"
    }

    const response = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        BYBIT_API_KEY_EXISTS: !!apiKey,
        BYBIT_API_SECRET_EXISTS: !!apiSecret,
        BYBIT_API_KEY_LENGTH: apiKey?.length || 0,
        BYBIT_API_SECRET_LENGTH: apiSecret?.length || 0,
        BYBIT_API_KEY_PREVIEW: apiKey ? `${apiKey.substring(0, 8)}...` : null,
        BYBIT_API_SECRET_PREVIEW: apiSecret ? `${apiSecret.substring(0, 8)}...` : null,
      },
      diagnosis: {
        keysExist,
        keysValid,
        keysConfigured,
        issue,
        solution,
      },
    }

    console.log("📊 Статус системы:", response.diagnosis)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Ошибка проверки статуса:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: error?.toString(),
        diagnosis: {
          keysExist: false,
          keysValid: false,
          keysConfigured: false,
          issue: "Критическая ошибка системы",
          solution: "Проверьте логи сервера",
        },
      },
      { status: 500 },
    )
  }
}
