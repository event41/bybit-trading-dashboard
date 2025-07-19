"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { PerformancePoint } from "@/types/trading"

interface PerformanceChartProps {
  data: PerformancePoint[]
  height?: number
}

export function PerformanceChart({ data, height = 120 }: PerformanceChartProps) {
  // Определяем цвет линии на основе общей доходности
  const totalReturn = data.length > 0 ? data[data.length - 1].cumulativePnL : 0
  const lineColor = totalReturn >= 0 ? "#16a34a" : "#dc2626"

  // Форматируем данные для графика
  const chartData = data.map((point, index) => ({
    ...point,
    day: index + 1,
    formattedDate: new Date(point.timestamp).toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
    }),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.formattedDate}</p>
          <p className="text-sm text-gray-600">
            Баланс: <span className="font-medium">${data.balance.toFixed(2)}</span>
          </p>
          <p className={`text-sm ${data.cumulativePnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            P&L:{" "}
            <span className="font-medium">
              {data.cumulativePnL >= 0 ? "+" : ""}${data.cumulativePnL.toFixed(2)}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
