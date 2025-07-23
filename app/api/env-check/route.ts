import { NextResponse } from "next/server"

export async function GET() {
  console.log("🔍 === ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===")

  // Получаем все переменные окружения
  const envInfo = {
    // Основные переменные
    NODE_ENV: process.env.NODE_ENV,

    // Bybit переменные
    BYBIT_API_KEY: process.env.BYBIT_API_KEY,
    BYBIT_API_SECRET: process.env.BYBIT_API_SECRET,

    // Информация о переменных
    bybitApiKeyExists: !!process.env.BYBIT_API_KEY,
    bybitApiSecretExists: !!process.env.BYBIT_API_SECRET,
    bybitApiKeyLength: process.env.BYBIT_API_KEY?.length || 0,
    bybitApiSecretLength: process.env.BYBIT_API_SECRET?.length || 0,
    bybitApiKeyPreview: process.env.BYBIT_API_KEY ? `${process.env.BYBIT_API_KEY.substring(0, 8)}...` : null,
    bybitApiSecretPreview: process.env.BYBIT_API_SECRET ? `${process.env.BYBIT_API_SECRET.substring(0, 8)}...` : null,

    // Все переменные с BYBIT
    allBybitVars: Object.keys(process.env).filter((key) => key.includes("BYBIT")),

    // Общая информация
    totalEnvVars: Object.keys(process.env).length,
    timestamp: new Date().toISOString(),
  }

  console.log("📋 Информация о переменных окружения:")
  console.log("- NODE_ENV:", envInfo.NODE_ENV)
  console.log("- BYBIT_API_KEY найден:", envInfo.bybitApiKeyExists)
  console.log("- BYBIT_API_SECRET найден:", envInfo.bybitApiSecretExists)
  console.log("- Длина API Key:", envInfo.bybitApiKeyLength)
  console.log("- Длина API Secret:", envInfo.bybitApiSecretLength)
  console.log("- Все BYBIT переменные:", envInfo.allBybitVars)

  return NextResponse.json({
    success: true,
    environment: envInfo,
    diagnosis: {
      keysFound: envInfo.bybitApiKeyExists && envInfo.bybitApiSecretExists,
      issue:
        !envInfo.bybitApiKeyExists || !envInfo.bybitApiSecretExists
          ? "API ключи не найдены в переменных окружения"
          : "API ключи найдены",
      recommendation:
        !envInfo.bybitApiKeyExists || !envInfo.bybitApiSecretExists
          ? "Проверьте файл .env.local и перезапустите сервер"
          : "Ключи настроены правильно",
    },
  })
}
