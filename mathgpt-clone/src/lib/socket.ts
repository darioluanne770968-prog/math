"use client"

import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export interface VideoGenerationProgress {
  videoId: string
  status: "pending" | "generating_script" | "generating_audio" | "rendering" | "completed" | "failed"
  progress: number // 0-100
  message?: string
  error?: string
}

export function initSocket(userId: string): Socket {
  if (socket) return socket

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    auth: { userId },
    transports: ["websocket", "polling"],
  })

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id)
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected")
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Subscribe to video generation progress
export function subscribeToVideoProgress(
  videoId: string,
  callback: (progress: VideoGenerationProgress) => void
): () => void {
  if (!socket) {
    console.error("Socket not initialized")
    return () => {}
  }

  const event = `video:${videoId}:progress`

  socket.on(event, callback)

  // Subscribe to this video's updates
  socket.emit("subscribe:video", videoId)

  // Return unsubscribe function
  return () => {
    socket?.off(event, callback)
    socket?.emit("unsubscribe:video", videoId)
  }
}

// Subscribe to user notifications
export function subscribeToNotifications(
  userId: string,
  callback: (notification: {
    type: string
    title: string
    message: string
    data?: Record<string, unknown>
  }) => void
): () => void {
  if (!socket) {
    console.error("Socket not initialized")
    return () => {}
  }

  const event = `user:${userId}:notification`

  socket.on(event, callback)

  return () => {
    socket?.off(event, callback)
  }
}
