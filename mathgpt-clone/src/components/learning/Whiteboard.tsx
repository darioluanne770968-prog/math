"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Undo,
  Redo,
  Trash2,
  Download,
  Palette,
} from "lucide-react"

type Tool = "pen" | "eraser" | "line" | "rectangle" | "circle" | "text"

interface Point {
  x: number
  y: number
}

interface DrawAction {
  tool: Tool
  color: string
  strokeWidth: number
  points?: Point[]
  start?: Point
  end?: Point
  text?: string
}

interface WhiteboardProps {
  width?: number
  height?: number
  onSave?: (dataUrl: string) => void
  collaborative?: boolean
  onDraw?: (action: DrawAction) => void
}

const colors = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

export function Whiteboard({
  width = 800,
  height = 600,
  onSave,
  onDraw,
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("pen")
  const [color, setColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    return canvas?.getContext("2d")
  }, [])

  // Initialize canvas
  useEffect(() => {
    const ctx = getContext()
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      saveToHistory()
    }
  }, [getContext, width, height])

  const saveToHistory = useCallback(() => {
    const ctx = getContext()
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, width, height)
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData])
      setHistoryIndex((prev) => prev + 1)
    }
  }, [getContext, width, height, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const ctx = getContext()
      if (ctx) {
        ctx.putImageData(history[historyIndex - 1], 0, 0)
        setHistoryIndex((prev) => prev - 1)
      }
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const ctx = getContext()
      if (ctx) {
        ctx.putImageData(history[historyIndex + 1], 0, 0)
        setHistoryIndex((prev) => prev + 1)
      }
    }
  }

  const clear = () => {
    const ctx = getContext()
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      saveToHistory()
    }
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPoint(pos)
    setCurrentPoints([pos])

    const ctx = getContext()
    if (!ctx) return

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
      ctx.lineWidth = tool === "eraser" ? strokeWidth * 3 : strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const pos = getMousePos(e)
    const ctx = getContext()
    if (!ctx) return

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      setCurrentPoints((prev) => [...prev, pos])
    } else if (tool === "line" || tool === "rectangle" || tool === "circle") {
      // For shapes, we need to redraw from history
      if (historyIndex >= 0) {
        ctx.putImageData(history[historyIndex], 0, 0)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.beginPath()

      if (tool === "line" && startPoint) {
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === "rectangle" && startPoint) {
        ctx.strokeRect(
          startPoint.x,
          startPoint.y,
          pos.x - startPoint.x,
          pos.y - startPoint.y
        )
      } else if (tool === "circle" && startPoint) {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
        )
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()

      // Notify collaborative mode
      if (onDraw && startPoint) {
        onDraw({
          tool,
          color,
          strokeWidth,
          points: currentPoints,
          start: startPoint,
          end: currentPoints[currentPoints.length - 1],
        })
      }

      setCurrentPoints([])
      setStartPoint(null)
    }
  }

  const handleTextTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "text") return

    const pos = getMousePos(e)
    const text = prompt("Enter text:")
    if (text) {
      const ctx = getContext()
      if (ctx) {
        ctx.font = `${strokeWidth * 6}px sans-serif`
        ctx.fillStyle = color
        ctx.fillText(text, pos.x, pos.y)
        saveToHistory()

        if (onDraw) {
          onDraw({
            tool: "text",
            color,
            strokeWidth,
            start: pos,
            text,
          })
        }
      }
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = "whiteboard.png"
      link.href = dataUrl
      link.click()

      if (onSave) {
        onSave(dataUrl)
      }
    }
  }

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
    { id: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
    { id: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
    { id: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { id: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle" },
    { id: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Virtual Whiteboard</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadCanvas}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-1">
            {tools.map((t) => (
              <Button
                key={t.id}
                variant={tool === t.id ? "default" : "outline"}
                size="icon"
                onClick={() => setTool(t.id)}
                title={t.label}
              >
                {t.icon}
              </Button>
            ))}
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Color Picker */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{ backgroundColor: color }}
            >
              <Palette className="h-4 w-4" style={{ color: color === "#ffffff" ? "#000" : "#fff" }} />
            </Button>
            {showColorPicker && (
              <div className="absolute top-full mt-2 left-0 z-10 bg-card border rounded-lg p-2 shadow-lg grid grid-cols-3 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "#3b82f6" : "transparent",
                    }}
                    onClick={() => {
                      setColor(c)
                      setShowColorPicker(false)
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Stroke Width */}
          <div className="flex items-center gap-2 w-32">
            <span className="text-sm text-muted-foreground">Size</span>
            <Slider
              value={[strokeWidth]}
              onValueChange={(v) => setStrokeWidth(v[0])}
              min={1}
              max={20}
              step={1}
              className="w-20"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={handleTextTool}
          />
        </div>
      </CardContent>
    </Card>
  )
}
