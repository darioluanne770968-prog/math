"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KnowledgeNode {
  id: string
  name: string
  category: string
  mastery: number
  x: number
  y: number
  connections: string[]
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[]
  onNodeClick?: (nodeId: string) => void
}

const categoryColors: Record<string, string> = {
  algebra: "#3b82f6",
  geometry: "#10b981",
  calculus: "#8b5cf6",
  trigonometry: "#f59e0b",
  statistics: "#ef4444",
  physics: "#06b6d4",
  chemistry: "#ec4899",
}

export function KnowledgeGraph({ nodes, onNodeClick }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.strokeStyle = "rgba(100, 100, 100, 0.3)"
      ctx.lineWidth = 2
      nodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const connNode = nodes.find((n) => n.id === connId)
          if (connNode) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connNode.x, connNode.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id
        const isSelected = selectedNode?.id === node.id
        const radius = isHovered || isSelected ? 35 : 30
        const color = categoryColors[node.category] || "#6b7280"

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.2 + (node.mastery / 100) * 0.8
        ctx.fill()
        ctx.globalAlpha = 1

        // Border
        ctx.strokeStyle = isSelected ? "#fff" : color
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.stroke()

        // Mastery ring
        if (node.mastery > 0) {
          ctx.beginPath()
          ctx.arc(
            node.x,
            node.y,
            radius + 5,
            -Math.PI / 2,
            -Math.PI / 2 + (Math.PI * 2 * node.mastery) / 100
          )
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // Label
        ctx.fillStyle = "#fff"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const shortName = node.name.length > 10 ? node.name.slice(0, 8) + "..." : node.name
        ctx.fillText(shortName, node.x, node.y)
      })
    }

    draw()
  }, [nodes, hoveredNode, selectedNode])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = nodes.find((node) => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) <= 35
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      onNodeClick?.(clickedNode.id)
    } else {
      setSelectedNode(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = nodes.find((node) => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) <= 35
    })

    setHoveredNode(hovered || null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Knowledge Graph
          <div className="flex gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <Badge
                key={category}
                variant="outline"
                style={{ borderColor: color, color }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full border rounded-lg bg-background cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
          />

          {(hoveredNode || selectedNode) && (
            <div className="absolute top-4 right-4 bg-card border rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold">
                {(hoveredNode || selectedNode)?.name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {(hoveredNode || selectedNode)?.category}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Mastery</span>
                  <span>{(hoveredNode || selectedNode)?.mastery}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(hoveredNode || selectedNode)?.mastery}%`,
                      backgroundColor:
                        categoryColors[
                          (hoveredNode || selectedNode)?.category || ""
                        ],
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Generate sample knowledge graph data
export function generateKnowledgeGraphData(): KnowledgeNode[] {
  return [
    { id: "numbers", name: "Numbers", category: "algebra", mastery: 100, x: 100, y: 250, connections: ["arithmetic"] },
    { id: "arithmetic", name: "Arithmetic", category: "algebra", mastery: 95, x: 200, y: 200, connections: ["algebra-basics"] },
    { id: "algebra-basics", name: "Algebra Basics", category: "algebra", mastery: 85, x: 300, y: 150, connections: ["linear-eq", "polynomials"] },
    { id: "linear-eq", name: "Linear Equations", category: "algebra", mastery: 75, x: 400, y: 100, connections: ["systems", "quadratic"] },
    { id: "polynomials", name: "Polynomials", category: "algebra", mastery: 70, x: 400, y: 200, connections: ["quadratic", "factoring"] },
    { id: "systems", name: "Systems", category: "algebra", mastery: 60, x: 500, y: 80, connections: ["matrices"] },
    { id: "quadratic", name: "Quadratic", category: "algebra", mastery: 55, x: 500, y: 150, connections: ["complex"] },
    { id: "factoring", name: "Factoring", category: "algebra", mastery: 50, x: 500, y: 220, connections: ["complex"] },
    { id: "complex", name: "Complex Numbers", category: "algebra", mastery: 30, x: 600, y: 180, connections: [] },
    { id: "matrices", name: "Matrices", category: "algebra", mastery: 25, x: 600, y: 80, connections: [] },

    { id: "geo-basics", name: "Geometry Basics", category: "geometry", mastery: 90, x: 150, y: 350, connections: ["triangles", "circles"] },
    { id: "triangles", name: "Triangles", category: "geometry", mastery: 80, x: 250, y: 300, connections: ["trig-basics"] },
    { id: "circles", name: "Circles", category: "geometry", mastery: 75, x: 250, y: 400, connections: ["trig-basics"] },
    { id: "trig-basics", name: "Trig Basics", category: "trigonometry", mastery: 65, x: 350, y: 350, connections: ["trig-identities"] },
    { id: "trig-identities", name: "Trig Identities", category: "trigonometry", mastery: 45, x: 450, y: 350, connections: ["calc-trig"] },

    { id: "limits", name: "Limits", category: "calculus", mastery: 40, x: 550, y: 300, connections: ["derivatives"] },
    { id: "derivatives", name: "Derivatives", category: "calculus", mastery: 30, x: 650, y: 280, connections: ["integrals", "calc-trig"] },
    { id: "integrals", name: "Integrals", category: "calculus", mastery: 20, x: 750, y: 250, connections: [] },
    { id: "calc-trig", name: "Calc & Trig", category: "calculus", mastery: 15, x: 650, y: 380, connections: [] },

    { id: "probability", name: "Probability", category: "statistics", mastery: 70, x: 200, y: 450, connections: ["distributions"] },
    { id: "distributions", name: "Distributions", category: "statistics", mastery: 50, x: 300, y: 450, connections: ["hypothesis"] },
    { id: "hypothesis", name: "Hypothesis Testing", category: "statistics", mastery: 35, x: 400, y: 450, connections: [] },
  ]
}
