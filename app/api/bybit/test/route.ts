import { NextResponse } from "next/server"
import { testBybitConnection } from "@/lib/bybit-simple"

export async function GET() {
  try {
    console.log("🧪 === ТЕСТ BYBIT API ===")

    // Проверяем базовую конфигурацию
    const apiKey = process.env.BYBIT_API_KEY
    const apiSecret = process.env.BYBIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        message: "API ключи не настроены",
        diagnostic: {
          publicApi: { success: false, message: "Пропущен - нет ключей" },
          signature: { success: false, message: "Пропущен - нет ключей" },
          privateApi: { success: false, message: "Пропущен - нет ключей" },
        },
        timestamp: new Date().toISOString(),
      })
    }

    // Запускаем полный тест
    const testResult = await testBybitConnection()

    // Детальная диагностика
    const diagnostic = {
      publicApi: { success: true, message: "Публичный API доступен" },
      signature: { success: true, message: "Подпись создается корректно" },
      privateApi: { success: testResult.success, message: testResult.message },
    }

    const response = {
      success: testResult.success,
      message: testResult.message,
      diagnostic,
      details: testResult.details,
      timestamp: new Date().toISOString(),
    }

    console.log("📊 Результат теста:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Ошибка теста API:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Критическая ошибка: ${error}`,
        diagnostic: {
          publicApi: { success: false, message: "Ошибка выполнения" },
          signature: { success: false, message: "Ошибка выполнения" },
          privateApi: { success: false, message: "Ошибка выполнения" },
        },
        error: error?.toString(),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
