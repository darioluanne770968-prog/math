"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

export interface Note {
  id: string
  videoId: string
  content: string
  timestamp: number // video timestamp in seconds
  createdAt: Date
  updatedAt: Date
}

export function useNotes(userId: string | undefined, videoId?: string) {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch notes
  React.useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchNotes() {
      try {
        let query = supabase
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (videoId) {
          query = query.eq("video_id", videoId)
        }

        const { data, error } = await query

        if (error) throw error

        setNotes(
          data?.map((item) => ({
            id: item.id,
            videoId: item.video_id,
            content: item.content,
            timestamp: item.timestamp,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          })) || []
        )
      } catch (error) {
        console.error("Failed to fetch notes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [userId, videoId])

  // Add note
  const addNote = React.useCallback(
    async (videoId: string, content: string, timestamp: number = 0) => {
      if (!userId) return null

      try {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            user_id: userId,
            video_id: videoId,
            content,
            timestamp,
          })
          .select()
          .single()

        if (error) throw error

        const newNote: Note = {
          id: data.id,
          videoId: data.video_id,
          content: data.content,
          timestamp: data.timestamp,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        }

        setNotes((prev) => [newNote, ...prev])
        return newNote
      } catch (error) {
        console.error("Failed to add note:", error)
        return null
      }
    },
    [userId]
  )

  // Update note
  const updateNote = React.useCallback(
    async (noteId: string, content: string) => {
      try {
        const { error } = await supabase
          .from("notes")
          .update({ content, updated_at: new Date().toISOString() })
          .eq("id", noteId)

        if (error) throw error

        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? { ...note, content, updatedAt: new Date() }
              : note
          )
        )
      } catch (error) {
        console.error("Failed to update note:", error)
      }
    },
    []
  )

  // Delete note
  const deleteNote = React.useCallback(async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId)

      if (error) throw error

      setNotes((prev) => prev.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }, [])

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  }
}
