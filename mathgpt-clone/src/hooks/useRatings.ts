"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

export interface VideoRating {
  videoId: string
  averageRating: number
  totalRatings: number
  userRating?: number
}

export function useRatings(videoId: string, userId?: string) {
  const [rating, setRating] = React.useState<VideoRating>({
    videoId,
    averageRating: 0,
    totalRatings: 0,
  })
  const [loading, setLoading] = React.useState(true)

  // Fetch ratings
  React.useEffect(() => {
    async function fetchRatings() {
      try {
        // Get average rating
        const { data: stats, error: statsError } = await supabase
          .from("video_ratings")
          .select("rating")
          .eq("video_id", videoId)

        if (statsError) throw statsError

        const ratings = stats?.map((r) => r.rating) || []
        const average =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0

        let userRating: number | undefined

        // Get user's rating if logged in
        if (userId) {
          const { data: userRatingData } = await supabase
            .from("video_ratings")
            .select("rating")
            .eq("video_id", videoId)
            .eq("user_id", userId)
            .single()

          userRating = userRatingData?.rating
        }

        setRating({
          videoId,
          averageRating: Math.round(average * 10) / 10,
          totalRatings: ratings.length,
          userRating,
        })
      } catch (error) {
        console.error("Failed to fetch ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [videoId, userId])

  // Submit rating
  const submitRating = React.useCallback(
    async (value: number) => {
      if (!userId) return

      try {
        const { error } = await supabase.from("video_ratings").upsert({
          video_id: videoId,
          user_id: userId,
          rating: value,
        })

        if (error) throw error

        // Recalculate average
        const { data: stats } = await supabase
          .from("video_ratings")
          .select("rating")
          .eq("video_id", videoId)

        const ratings = stats?.map((r) => r.rating) || []
        const average =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0

        setRating({
          videoId,
          averageRating: Math.round(average * 10) / 10,
          totalRatings: ratings.length,
          userRating: value,
        })
      } catch (error) {
        console.error("Failed to submit rating:", error)
      }
    },
    [videoId, userId]
  )

  return {
    rating,
    loading,
    submitRating,
  }
}
