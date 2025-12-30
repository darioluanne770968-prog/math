"use client"

import { io, Socket } from "socket.io-client"

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
}

export interface CollaborationRoom {
  id: string
  name: string
  users: CollaborationUser[]
  createdAt: Date
  type: "whiteboard" | "document" | "video"
}

export interface CollaborationEvent {
  type: "draw" | "cursor" | "chat" | "sync" | "join" | "leave"
  userId: string
  data: unknown
  timestamp: Date
}

class CollaborationService {
  private socket: Socket | null = null
  private roomId: string | null = null
  private userId: string | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  connect(serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001") {
    if (this.socket?.connected) return

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      autoConnect: true,
    })

    this.socket.on("connect", () => {
      console.log("Connected to collaboration server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from collaboration server")
    })

    // Forward events to listeners
    this.socket.onAny((event, data) => {
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        eventListeners.forEach((callback) => callback(data))
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.roomId = null
    this.userId = null
  }

  joinRoom(roomId: string, user: { id: string; name: string; avatar?: string }) {
    if (!this.socket) {
      throw new Error("Not connected to collaboration server")
    }

    this.roomId = roomId
    this.userId = user.id

    this.socket.emit("join-room", {
      roomId,
      user: {
        ...user,
        color: this.generateUserColor(user.id),
      },
    })
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit("leave-room", { roomId: this.roomId, userId: this.userId })
      this.roomId = null
    }
  }

  sendCursor(position: { x: number; y: number }) {
    if (this.socket && this.roomId) {
      this.socket.emit("cursor-move", {
        roomId: this.roomId,
        userId: this.userId,
        position,
      })
    }
  }

  sendDrawAction(action: unknown) {
    if (this.socket && this.roomId) {
      this.socket.emit("draw-action", {
        roomId: this.roomId,
        userId: this.userId,
        action,
      })
    }
  }

  sendChatMessage(message: string) {
    if (this.socket && this.roomId) {
      this.socket.emit("chat-message", {
        roomId: this.roomId,
        userId: this.userId,
        message,
        timestamp: new Date(),
      })
    }
  }

  syncState(state: unknown) {
    if (this.socket && this.roomId) {
      this.socket.emit("sync-state", {
        roomId: this.roomId,
        userId: this.userId,
        state,
      })
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  private generateUserColor(userId: string): string {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#14b8a6",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ]
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  getRoomId() {
    return this.roomId
  }

  getUserId() {
    return this.userId
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const collaborationService = new CollaborationService()

// React hook for collaboration
export function useCollaboration(roomId: string, user: { id: string; name: string }) {
  const [users, setUsers] = React.useState<CollaborationUser[]>([])
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    collaborationService.connect()
    collaborationService.joinRoom(roomId, user)
    setIsConnected(true)

    const unsubUsers = collaborationService.on("room-users", (data) => {
      setUsers((data as { users: CollaborationUser[] }).users)
    })

    const unsubJoin = collaborationService.on("user-joined", (data) => {
      setUsers((prev) => [...prev, (data as { user: CollaborationUser }).user])
    })

    const unsubLeave = collaborationService.on("user-left", (data) => {
      setUsers((prev) =>
        prev.filter((u) => u.id !== (data as { userId: string }).userId)
      )
    })

    return () => {
      collaborationService.leaveRoom()
      collaborationService.disconnect()
      unsubUsers()
      unsubJoin()
      unsubLeave()
    }
  }, [roomId, user])

  return {
    users,
    isConnected,
    sendCursor: collaborationService.sendCursor.bind(collaborationService),
    sendDrawAction: collaborationService.sendDrawAction.bind(collaborationService),
    sendChatMessage: collaborationService.sendChatMessage.bind(collaborationService),
    on: collaborationService.on.bind(collaborationService),
  }
}

import React from "react"
