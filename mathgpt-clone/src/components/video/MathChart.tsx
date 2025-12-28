"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

interface Point {
  x: number
  y: number
}

interface MathChartProps {
  equation?: string
  points?: Point[]
  xRange?: [number, number]
  yRange?: [number, number]
  showGrid?: boolean
  showAxis?: boolean
  color?: string
  fillArea?: boolean
  referenceLines?: { x?: number; y?: number; label?: string }[]
  className?: string
}

// Parse and evaluate simple math expressions
function evaluateExpression(expr: string, x: number): number {
  try {
    // Replace common math functions and constants
    const sanitized = expr
      .replace(/\^/g, "**")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/abs/g, "Math.abs")
      .replace(/log/g, "Math.log")
      .replace(/exp/g, "Math.exp")
      .replace(/pi/gi, "Math.PI")
      .replace(/e(?![xp])/gi, "Math.E")
      .replace(/x/g, `(${x})`)

    // eslint-disable-next-line no-eval
    return eval(sanitized)
  } catch {
    return NaN
  }
}

// Generate points from equation
function generatePoints(
  equation: string,
  xRange: [number, number],
  numPoints: number = 200
): Point[] {
  const [xMin, xMax] = xRange
  const step = (xMax - xMin) / numPoints
  const points: Point[] = []

  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateExpression(equation, x)
    if (!isNaN(y) && isFinite(y)) {
      points.push({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 })
    }
  }

  return points
}

export function MathChart({
  equation,
  points: externalPoints,
  xRange = [-10, 10],
  yRange,
  showGrid = true,
  showAxis = true,
  color = "#10b981",
  fillArea = false,
  referenceLines = [],
  className,
}: MathChartProps) {
  const points = React.useMemo(() => {
    if (externalPoints) return externalPoints
    if (equation) return generatePoints(equation, xRange)
    return []
  }, [equation, externalPoints, xRange])

  // Calculate y range if not provided
  const calculatedYRange = React.useMemo(() => {
    if (yRange) return yRange
    if (points.length === 0) return [-10, 10]

    const yValues = points.map((p) => p.y).filter((y) => isFinite(y))
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const padding = (yMax - yMin) * 0.1

    return [
      Math.floor(yMin - padding),
      Math.ceil(yMax + padding),
    ] as [number, number]
  }, [points, yRange])

  const ChartComponent = fillArea ? AreaChart : LineChart

  return (
    <div className={cn("w-full h-64 bg-card rounded-xl p-4", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={points}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
          )}

          {showAxis && (
            <>
              <XAxis
                dataKey="x"
                type="number"
                domain={xRange}
                stroke="var(--muted-foreground)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                domain={calculatedYRange}
                stroke="var(--muted-foreground)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
            </>
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value: number | undefined) => [value?.toFixed(4) ?? "N/A", "y"]}
            labelFormatter={(x: number | string) => `x = ${typeof x === 'number' ? x.toFixed(4) : x}`}
          />

          {/* Reference lines */}
          {referenceLines.map((ref, index) => (
            <React.Fragment key={index}>
              {ref.x !== undefined && (
                <ReferenceLine
                  x={ref.x}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={ref.label}
                />
              )}
              {ref.y !== undefined && (
                <ReferenceLine
                  y={ref.y}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={ref.label}
                />
              )}
            </React.Fragment>
          ))}

          {/* Axis lines at 0 */}
          <ReferenceLine x={0} stroke="var(--muted-foreground)" />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" />

          {fillArea ? (
            <Area
              type="monotone"
              dataKey="y"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={false}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>

      {equation && (
        <div className="text-center mt-2 text-sm text-muted-foreground font-mono">
          y = {equation}
        </div>
      )}
    </div>
  )
}

// Preset chart configurations for common functions
export const chartPresets = {
  quadratic: { equation: "x^2", xRange: [-5, 5] as [number, number] },
  cubic: { equation: "x^3", xRange: [-3, 3] as [number, number] },
  sine: { equation: "sin(x)", xRange: [-2*Math.PI, 2*Math.PI] as [number, number] },
  cosine: { equation: "cos(x)", xRange: [-2*Math.PI, 2*Math.PI] as [number, number] },
  exponential: { equation: "exp(x)", xRange: [-3, 3] as [number, number] },
  logarithm: { equation: "log(x)", xRange: [0.1, 10] as [number, number] },
  absolute: { equation: "abs(x)", xRange: [-5, 5] as [number, number] },
  reciprocal: { equation: "1/x", xRange: [-5, 5] as [number, number] },
}
