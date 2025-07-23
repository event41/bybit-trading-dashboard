import { NextResponse } from "next/server"
import { getBybitPositions } from "@/lib/bybit-simple"

export async function GET() {
  try {
    console.log("📊 === ПОЛУЧЕНИЕ ПОЗИЦИЙ ===")

    // Проверяем API ключи
    const apiKey = process.env.BYBIT_API_KEY
    const apiSecret = process.env.BYBIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.log("❌ API ключи не найдены")
      return NextResponse.json({
        positions: [],
        error: "API ключи не настроены",
        message: "Создайте файл .env.local с реальными ключами Bybit",
      })
    }

    // Получаем реальные позиции с обработкой ошибок
    let rawPositions = []

    try {
      rawPositions = await getBybitPositions()
      console.log("✅ Позиции получены:", rawPositions.length)
    } catch (error) {
      console.log("⚠️ Ошибка получения позиций:", error)
      return NextResponse.json({
        positions: [],
        error: "Ошибка получения позиций",
        message: error?.toString() || "Не удалось получить позиции с Bybit",
      })
    }

    // Преобразуем в нужный формат только открытые позиции
    const positions = rawPositions
      .filter((pos: any) => pos.size && Number.parseFloat(pos.size) > 0)
      .map((pos: any, index: number) => {
        const size = Number.parseFloat(pos.size || "0")
        const entryPrice = Number.parseFloat(pos.entryPrice || "0")
        const markPrice = Number.parseFloat(pos.markPrice || "0")
        const unrealisedPnl = Number.parseFloat(pos.unrealisedPnl || "0")
        const positionValue = Number.parseFloat(pos.positionValue || "1")

        return {
          id: `pos-${index}`,
          botId: "live-bot-1",
          symbol: pos.symbol || "UNKNOWN",
          side: pos.side || "Buy",
          size: size,
          entryPrice: entryPrice,
          currentPrice: markPrice,
          pnl: unrealisedPnl,
          pnlPercentage: positionValue > 0 ? (unrealisedPnl / positionValue) * 100 : 0,
          openTime: pos.createdTime || new Date().toISOString(),
        }
      })

    console.log("✅ Позиции обработаны:", positions.length)

    return NextResponse.json({
      positions,
      success: true,
      message: `Получено ${positions.length} открытых позиций`,
    })
  } catch (error) {
    console.error("❌ Критическая ошибка получения позиций:", error)
    return NextResponse.json({
      positions: [],
      error: "Критическая ошибка",
      message: error?.toString() || "Неизвестная ошибка",
      success: false,
    })
  }
}
