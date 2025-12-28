"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { SubjectNav } from "@/components/layout/SubjectNav"
import { FileUpload } from "@/components/video/FileUpload"
import { MathInput } from "@/components/video/MathInput"
import { cn } from "@/lib/utils"

export default function VideoCreatorPage() {
  const [question, setQuestion] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleMathInsert = (latex: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const mathExpression = `$${latex}$`
      const newValue =
        question.slice(0, start) + mathExpression + question.slice(end)
      setQuestion(newValue)
      // Set cursor position after inserted formula
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + mathExpression.length
        textarea.focus()
      }, 0)
    } else {
      setQuestion(question + `$${latex}$`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsSubmitting(true)
    // TODO: Implement video generation API call
    console.log("Generating video for:", question)
    setTimeout(() => {
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <SubjectNav />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 md:p-8">
          <div className="w-full max-w-2xl space-y-8">
            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Create An Explainer Video
              </h1>
              <p className="text-muted-foreground">
                Create engaging video explanations for any STEM concept with
                MathGPT
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <FileUpload
                onFilesChange={(files) => {
                  console.log("Files changed:", files)
                }}
              />

              {/* Question Input */}
              <div className="relative">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full p-4 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30">
                    <MathInput onInsert={handleMathInsert} />
                    <button
                      type="submit"
                      disabled={!question.trim() || isSubmitting}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        question.trim() && !isSubmitting
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <ArrowUp
                        className={cn(
                          "h-5 w-5",
                          isSubmitting && "animate-pulse"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Tips */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Tip: You can use the Math Input button to insert mathematical
                formulas using LaTeX notation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
