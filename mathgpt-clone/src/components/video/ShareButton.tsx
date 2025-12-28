"use client"

import * as React from "react"
import { Share2, Copy, Twitter, Facebook, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  videoId: string
  title: string
  className?: string
}

export function ShareButton({ videoId, title, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/video/${videoId}`
      : ""

  const shareText = `Check out this math explainer: ${title}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = async (platform: "twitter" | "facebook" | "native") => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          "_blank"
        )
        break
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank"
        )
        break
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: shareText,
              url: shareUrl,
            })
          } catch (error) {
            // User cancelled or share failed
          }
        }
        break
    }
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-card shadow-lg">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium mb-2">Share this video</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background truncate"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span className="text-sm">Share on Twitter</span>
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="text-sm">Share on Facebook</span>
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={() => handleShare("native")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm">More options...</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
