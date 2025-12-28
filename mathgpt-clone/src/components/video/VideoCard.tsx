"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface VideoCardProps {
  id: string
  title: string
  thumbnailUrl?: string
  createdAt: Date
  onClick?: () => void
  className?: string
}

export function VideoCard({
  id,
  title,
  thumbnailUrl,
  createdAt,
  onClick,
  className,
}: VideoCardProps) {
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <Play className="h-6 w-6 text-primary fill-primary ml-1" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
      </div>
    </div>
  )
}
