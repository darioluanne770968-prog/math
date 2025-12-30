"use client"

import * as React from "react"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  type: "image" | "pdf"
}

interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void
  onOcrResult?: (text: string) => void
  maxFiles?: number
  className?: string
}

export function FileUpload({
  onFilesChange,
  onOcrResult,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // OCR 识别图片中的数学公式
  const processImageOCR = async (file: File) => {
    if (!onOcrResult) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.text || data.formulas?.length > 0) {
          const result = [
            data.text,
            ...(data.formulas || []).map((f: string) => `$${f}$`)
          ].filter(Boolean).join("\n")
          onOcrResult(result)
        }
      }
    } catch (err) {
      console.error("OCR error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const acceptedTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "application/pdf": [".pdf"],
  }

  const handleFiles = React.useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = []

      Array.from(fileList).forEach((file) => {
        if (files.length + newFiles.length >= maxFiles) return

        const isImage = file.type.startsWith("image/")
        const isPdf = file.type === "application/pdf"

        if (!isImage && !isPdf) return

        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substring(7),
          file,
          type: isImage ? "image" : "pdf",
        }

        if (isImage) {
          uploadedFile.preview = URL.createObjectURL(file)
          // 对图片进行 OCR 识别
          processImageOCR(file)
        }

        newFiles.push(uploadedFile)
      })

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, maxFiles, onFilesChange, processImageOCR]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {isProcessing ? (
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isProcessing ? "正在识别图片中的数学公式..." : "拖放或点击上传图片/PDF"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              支持 JPG, PNG, GIF, PDF 格式，上传图片后自动识别数学公式
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-lg overflow-hidden border border-border bg-card"
            >
              {file.type === "image" && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-20 h-20 object-cover"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(file.id)
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                <p className="text-xs text-white truncate">{file.file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
