"use client"

import * as React from "react"
import { ArrowUp, Loader2, Play, Volume2 } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { SubjectNav } from "@/components/layout/SubjectNav"
import { FileUpload } from "@/components/video/FileUpload"
import { MathInput } from "@/components/video/MathInput"
import { cn } from "@/lib/utils"

interface VideoScript {
  title: string
  introduction: string
  steps: {
    title: string
    content: string
    formula?: string
    visualization?: string | null
  }[]
  conclusion: string
  estimatedDuration: number
}

export default function VideoCreatorPage() {
  const [question, setQuestion] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [script, setScript] = React.useState<VideoScript | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
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
    setError(null)
    setScript(null)

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: "zh" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate explanation")
      }

      setScript(data.script)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 试听语音
  const handlePlayAudio = async () => {
    if (!script) return

    // 如果正在播放，停止
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlayingAudio(false)
      return
    }

    setIsPlayingAudio(true)

    try {
      // 组合所有文本
      const textToSpeak = [
        script.title,
        script.introduction,
        ...script.steps.map((s, i) => `第${i + 1}步：${s.title}。${s.content}`),
        script.conclusion
      ].join("。")

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, voice: "nova" }),
      })

      if (!response.ok) throw new Error("TTS failed")

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (err) {
      console.error("Audio error:", err)
      setIsPlayingAudio(false)
    }
  }

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!script) return

    setIsGeneratingVideo(true)

    try {
      const response = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: script.title,
          steps: script.steps,
          primaryColor: "#10b981",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "视频渲染失败")
      }

      // 打开视频
      window.open(data.videoUrl, "_blank")
      alert(`视频生成成功！\n\n视频地址: ${data.videoUrl}`)
    } catch (err) {
      console.error("Video generation error:", err)
      alert(`视频生成失败: ${err instanceof Error ? err.message : "未知错误"}\n\n注意：视频渲染需要服务器端支持，本地开发环境可能不支持。`)
    } finally {
      setIsGeneratingVideo(false)
    }
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
                onOcrResult={(text) => {
                  // 将 OCR 识别结果追加到输入框
                  setQuestion((prev) => prev ? `${prev}\n${text}` : text)
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

            {/* Loading State */}
            {isSubmitting && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">AI 正在生成解释视频脚本...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                {error}
              </div>
            )}

            {/* Generated Script Result */}
            {script && (
              <div className="space-y-6 p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{script.title}</h2>
                  <span className="text-sm text-muted-foreground">
                    预计时长: {script.estimatedDuration}秒
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">简介</h3>
                  <p className="text-muted-foreground">{script.introduction}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">解题步骤</h3>
                  {script.steps.map((step, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-background"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                        <h4 className="font-medium">{step.title}</h4>
                      </div>
                      <p className="text-muted-foreground ml-9">{step.content}</p>
                      {step.formula && (
                        <div className="mt-3 ml-9 p-3 rounded bg-muted font-mono text-sm overflow-x-auto">
                          {step.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="font-semibold mb-2">总结</h3>
                  <p className="text-muted-foreground">{script.conclusion}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingVideo ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    {isGeneratingVideo ? "生成中..." : "生成视频"}
                  </button>
                  <button
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio && !audioRef.current}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors",
                      isPlayingAudio
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <Volume2 className={cn("h-5 w-5", isPlayingAudio && "animate-pulse")} />
                    {isPlayingAudio ? "停止播放" : "试听语音"}
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            {!script && !isSubmitting && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  提示: 点击 Math Input 按钮可以插入 LaTeX 数学公式
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
