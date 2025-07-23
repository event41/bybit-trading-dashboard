import { NextResponse } from "next/server"

export async function GET() {
  console.log("🔍 === ДЕТАЛЬНАЯ ДИАГНОСТИКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===")

  // Получаем все переменные окружения
  const envDiagnostic = {
    // Проверяем наличие ключей
    bybitApiKey: process.env.BYBIT_API_KEY || null,
    bybitApiSecret: process.env.BYBIT_API_SECRET || null,

    // Информация о ключах
    hasApiKey: !!process.env.BYBIT_API_KEY,
    hasApiSecret: !!process.env.BYBIT_API_SECRET,
    apiKeyLength: process.env.BYBIT_API_KEY?.length || 0,
    apiSecretLength: process.env.BYBIT_API_SECRET?.length || 0,

    // Превью ключей (безопасно)
    apiKeyPreview: process.env.BYBIT_API_KEY ? `${process.env.BYBIT_API_KEY.substring(0, 8)}...` : "НЕТ",
    apiSecretPreview: process.env.BYBIT_API_SECRET ? `${process.env.BYBIT_API_SECRET.substring(0, 8)}...` : "НЕТ",

    // Общая информация
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform,
    cwd: process.cwd(),

    // Все переменные с BYBIT
    allBybitVars: Object.keys(process.env).filter((key) => key.includes("BYBIT")),

    // Общее количество переменных
    totalEnvVars: Object.keys(process.env).length,

    // Время проверки
    timestamp: new Date().toISOString(),

    // Проверяем другие возможные имена
    alternativeKeys: {
      BYBIT_API_KEY: !!process.env.BYBIT_API_KEY,
      bybit_api_key: !!process.env.bybit_api_key,
      BYBIT_KEY: !!process.env.BYBIT_KEY,
      API_KEY: !!process.env.API_KEY,
    },
  }

  // Логируем в консоль сервера
  console.log("📋 Результаты диагностики:")
  console.log("- BYBIT_API_KEY найден:", envDiagnostic.hasApiKey)
  console.log("- BYBIT_API_SECRET найден:", envDiagnostic.hasApiSecret)
  console.log("- Длина API Key:", envDiagnostic.apiKeyLength)
  console.log("- Длина API Secret:", envDiagnostic.apiSecretLength)
  console.log("- NODE_ENV:", envDiagnostic.nodeEnv)
  console.log("- Рабочая папка:", envDiagnostic.cwd)
  console.log("- Все BYBIT переменные:", envDiagnostic.allBybitVars)
  console.log("- Общее количество переменных:", envDiagnostic.totalEnvVars)

  // Определяем проблему
  let diagnosis = "Неизвестная проблема"
  let recommendation = "Обратитесь к разработчику"
  let severity = "error"

  if (!envDiagnostic.hasApiKey && !envDiagnostic.hasApiSecret) {
    diagnosis = "Файл .env.local не найден или не загружен"
    recommendation = "Создайте файл .env.local в корневой папке и перезапустите сервер"
    severity = "critical"
  } else if (!envDiagnostic.hasApiKey) {
    diagnosis = "BYBIT_API_KEY не найден в переменных окружения"
    recommendation = "Добавьте BYBIT_API_KEY в файл .env.local"
    severity = "error"
  } else if (!envDiagnostic.hasApiSecret) {
    diagnosis = "BYBIT_API_SECRET не найден в переменных окружения"
    recommendation = "Добавьте BYBIT_API_SECRET в файл .env.local"
    severity = "error"
  } else if (envDiagnostic.apiKeyLength < 10) {
    diagnosis = "BYBIT_API_KEY слишком короткий"
    recommendation = "Проверьте правильность API ключа"
    severity = "warning"
  } else if (envDiagnostic.apiSecretLength < 20) {
    diagnosis = "BYBIT_API_SECRET слишком короткий"
    recommendation = "Проверьте правильность API секрета"
    severity = "warning"
  } else {
    diagnosis = "API ключи найдены и выглядят корректно"
    recommendation = "Проверьте права доступа ключей на Bybit"
    severity = "info"
  }

  return NextResponse.json({
    success: true,
    environment: envDiagnostic,
    diagnosis: {
      issue: diagnosis,
      recommendation,
      severity,
      keysFound: envDiagnostic.hasApiKey && envDiagnostic.hasApiSecret,
    },
    instructions: {
      step1: "Создайте файл .env.local в корневой папке проекта",
      step2: "Добавьте в него: BYBIT_API_KEY=ваш_ключ",
      step3: "Добавьте в него: BYBIT_API_SECRET=ваш_секрет",
      step4: "Полностью перезапустите сервер (Ctrl+C, затем npm run dev)",
      step5: "Обновите эту страницу",
    },
  })
}
