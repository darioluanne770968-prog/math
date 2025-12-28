"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

interface WatchProgress {
  videoId: string
  progress: number // 0-100
  completed: boolean
  lastWatched: Date
}

interface LearningStats {
  totalVideosWatched: number
  totalTimeSpent: number // in minutes
  completedVideos: number
  streak: number
  lastActive: Date
}

export function useProgress(userId: string | undefined) {
  const [progress, setProgress] = React.useState<WatchProgress[]>([])
  const [stats, setStats] = React.useState<LearningStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch progress data
  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchProgress() {
      try {
        const { data, error } = await supabase
          .from("watch_progress")
          .select("*")
          .eq("user_id", userId)
          .order("last_watched", { ascending: false })

        if (error) throw error

        setProgress(
          data?.map((item) => ({
            videoId: item.video_id,
            progress: item.progress,
            completed: item.completed,
            lastWatched: new Date(item.last_watched),
          })) || []
        )

        // Fetch stats
        const { data: statsData } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (statsData) {
          setStats({
            totalVideosWatched: statsData.total_videos_watched,
            totalTimeSpent: statsData.total_time_spent,
            completedVideos: statsData.completed_videos,
            streak: statsData.streak,
            lastActive: new Date(statsData.last_active),
          })
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId])

  // Update progress for a video
  const updateProgress = React.useCallback(
    async (videoId: string, progressPercent: number) => {
      if (!userId) return

      const completed = progressPercent >= 90

      try {
        await supabase.from("watch_progress").upsert({
          user_id: userId,
          video_id: videoId,
          progress: progressPercent,
          completed,
          last_watched: new Date().toISOString(),
        })

        setProgress((prev) => {
          const existing = prev.find((p) => p.videoId === videoId)
          if (existing) {
            return prev.map((p) =>
              p.videoId === videoId
                ? { ...p, progress: progressPercent, completed, lastWatched: new Date() }
                : p
            )
          }
          return [
            ...prev,
            { videoId, progress: progressPercent, completed, lastWatched: new Date() },
          ]
        })
      } catch (error) {
        console.error("Failed to update progress:", error)
      }
    },
    [userId]
  )

  // Get progress for a specific video
  const getVideoProgress = React.useCallback(
    (videoId: string): WatchProgress | undefined => {
      return progress.find((p) => p.videoId === videoId)
    },
    [progress]
  )

  return {
    progress,
    stats,
    loading,
    updateProgress,
    getVideoProgress,
  }
}
