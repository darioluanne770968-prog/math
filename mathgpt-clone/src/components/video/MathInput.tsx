"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathInputProps {
  onInsert?: (latex: string) => void
  className?: string
}

const MATH_SYMBOLS = [
  { symbol: "∑", latex: "\\sum" },
  { symbol: "∫", latex: "\\int" },
  { symbol: "√", latex: "\\sqrt{}" },
  { symbol: "π", latex: "\\pi" },
  { symbol: "∞", latex: "\\infty" },
  { symbol: "≠", latex: "\\neq" },
  { symbol: "≤", latex: "\\leq" },
  { symbol: "≥", latex: "\\geq" },
  { symbol: "±", latex: "\\pm" },
  { symbol: "×", latex: "\\times" },
  { symbol: "÷", latex: "\\div" },
  { symbol: "α", latex: "\\alpha" },
  { symbol: "β", latex: "\\beta" },
  { symbol: "θ", latex: "\\theta" },
  { symbol: "λ", latex: "\\lambda" },
  { symbol: "Δ", latex: "\\Delta" },
]

export function MathInput({ onInsert, className }: MathInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [latex, setLatex] = React.useState("")
  const [preview, setPreview] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (latex) {
      try {
        const html = katex.renderToString(latex, {
          throwOnError: true,
          displayMode: true,
        })
        setPreview(html)
        setError(null)
      } catch (e) {
        setError("Invalid LaTeX syntax")
        setPreview("")
      }
    } else {
      setPreview("")
      setError(null)
    }
  }, [latex])

  const handleInsertSymbol = (symbolLatex: string) => {
    const textarea = inputRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = latex.slice(0, start) + symbolLatex + latex.slice(end)
      setLatex(newValue)
      // Set cursor position after inserted symbol
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + symbolLatex.length
        textarea.focus()
      }, 0)
    } else {
      setLatex(latex + symbolLatex)
    }
  }

  const handleConfirm = () => {
    if (latex && !error) {
      onInsert?.(latex)
      setLatex("")
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setLatex("")
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <span className="font-serif text-lg">Σ</span>
        Math Input
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card border border-border rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Math Formula Input</h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Symbol shortcuts */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Quick symbols
                </p>
                <div className="flex flex-wrap gap-1">
                  {MATH_SYMBOLS.map(({ symbol, latex: symbolLatex }) => (
                    <button
                      key={symbol}
                      onClick={() => handleInsertSymbol(symbolLatex)}
                      className="w-9 h-9 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors flex items-center justify-center text-lg font-serif"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* LaTeX input */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  LaTeX expression
                </label>
                <textarea
                  ref={inputRef}
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  placeholder="e.g., \frac{1}{2} or x^2 + y^2 = z^2"
                  className="w-full h-24 p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>

              {/* Preview */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div
                  className={cn(
                    "min-h-16 p-4 rounded-lg border bg-background flex items-center justify-center",
                    error ? "border-destructive" : "border-border"
                  )}
                >
                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : preview ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: preview }}
                      className="overflow-x-auto"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a LaTeX expression to see preview
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!latex || !!error}>
                Insert Formula
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
