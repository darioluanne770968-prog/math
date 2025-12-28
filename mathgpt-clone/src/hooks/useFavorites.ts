"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch favorites
  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("video_id")
          .eq("user_id", userId)

        if (error) throw error

        setFavorites(data?.map((item) => item.video_id) || [])
      } catch (error) {
        console.error("Failed to fetch favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  // Toggle favorite
  const toggleFavorite = React.useCallback(
    async (videoId: string) => {
      if (!userId) return

      const isFavorite = favorites.includes(videoId)

      try {
        if (isFavorite) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("video_id", videoId)

          setFavorites((prev) => prev.filter((id) => id !== videoId))
        } else {
          await supabase.from("favorites").insert({
            user_id: userId,
            video_id: videoId,
          })

          setFavorites((prev) => [...prev, videoId])
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error)
      }
    },
    [userId, favorites]
  )

  // Check if video is favorite
  const isFavorite = React.useCallback(
    (videoId: string): boolean => {
      return favorites.includes(videoId)
    },
    [favorites]
  )

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
  }
}
