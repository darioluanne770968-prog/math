"use client"

import * as React from "react"
import {
  initSocket,
  disconnectSocket,
  subscribeToVideoProgress,
  subscribeToNotifications,
  type VideoGenerationProgress,
} from "@/lib/socket"
import { useAuth } from "@/components/layout/AuthProvider"

export function useSocket() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    if (!user?.id) return

    const socket = initSocket(user.id)

    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    return () => {
      disconnectSocket()
    }
  }, [user?.id])

  return { isConnected }
}

export function useVideoProgress(videoId: string | null) {
  const [progress, setProgress] = React.useState<VideoGenerationProgress | null>(
    null
  )

  React.useEffect(() => {
    if (!videoId) return

    const unsubscribe = subscribeToVideoProgress(videoId, (data) => {
      setProgress(data)
    })

    return unsubscribe
  }, [videoId])

  return progress
}

export function useNotifications(
  callback: (notification: {
    type: string
    title: string
    message: string
  }) => void
) {
  const { user } = useAuth()

  React.useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToNotifications(user.id, callback)

    return unsubscribe
  }, [user?.id, callback])
}
