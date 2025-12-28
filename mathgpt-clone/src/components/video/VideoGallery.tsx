"use client"

import * as React from "react"
import { VideoCard } from "./VideoCard"
import { cn } from "@/lib/utils"

interface Video {
  id: string
  title: string
  thumbnailUrl?: string
  createdAt: Date
}

// Mock data for demonstration
const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    title: "How to solve quadratic equations using the quadratic formula",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 19 * 60 * 1000), // 19 minutes ago
  },
  {
    id: "2",
    title: "Understanding derivatives and their applications",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "3",
    title: "Introduction to matrix multiplication",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: "4",
    title: "Solving systems of linear equations",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "5",
    title: "Trigonometric identities explained",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "6",
    title: "Integration techniques: u-substitution",
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
]

interface VideoGalleryProps {
  videos?: Video[]
  onVideoClick?: (video: Video) => void
  className?: string
}

export function VideoGallery({
  videos = MOCK_VIDEOS,
  onVideoClick,
  className,
}: VideoGalleryProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Explore MathGPT Videos</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
            createdAt={video.createdAt}
            onClick={() => onVideoClick?.(video)}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos yet. Create your first explainer video!</p>
        </div>
      )}
    </div>
  )
}
