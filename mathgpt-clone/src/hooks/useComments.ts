"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

export interface Comment {
  id: string
  videoId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  parentId?: string
  replies?: Comment[]
  likes: number
  createdAt: Date
}

export function useComments(videoId: string) {
  const [comments, setComments] = React.useState<Comment[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch comments
  React.useEffect(() => {
    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(`
            *,
            users:user_id (name, avatar_url)
          `)
          .eq("video_id", videoId)
          .order("created_at", { ascending: false })

        if (error) throw error

        const formattedComments: Comment[] = (data || []).map((item) => ({
          id: item.id,
          videoId: item.video_id,
          userId: item.user_id,
          userName: item.users?.name || "Anonymous",
          userAvatar: item.users?.avatar_url,
          content: item.content,
          parentId: item.parent_id,
          likes: item.likes || 0,
          createdAt: new Date(item.created_at),
        }))

        // Organize replies
        const topLevel = formattedComments.filter((c) => !c.parentId)
        const replies = formattedComments.filter((c) => c.parentId)

        topLevel.forEach((comment) => {
          comment.replies = replies.filter((r) => r.parentId === comment.id)
        })

        setComments(topLevel)
      } catch (error) {
        console.error("Failed to fetch comments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [videoId])

  // Add comment
  const addComment = React.useCallback(
    async (userId: string, content: string, parentId?: string) => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .insert({
            video_id: videoId,
            user_id: userId,
            content,
            parent_id: parentId,
          })
          .select(`
            *,
            users:user_id (name, avatar_url)
          `)
          .single()

        if (error) throw error

        const newComment: Comment = {
          id: data.id,
          videoId: data.video_id,
          userId: data.user_id,
          userName: data.users?.name || "Anonymous",
          userAvatar: data.users?.avatar_url,
          content: data.content,
          parentId: data.parent_id,
          likes: 0,
          createdAt: new Date(data.created_at),
        }

        if (parentId) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === parentId
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  }
                : comment
            )
          )
        } else {
          setComments((prev) => [newComment, ...prev])
        }

        return newComment
      } catch (error) {
        console.error("Failed to add comment:", error)
        return null
      }
    },
    [videoId]
  )

  // Delete comment
  const deleteComment = React.useCallback(
    async (commentId: string, userId: string) => {
      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId)
          .eq("user_id", userId)

        if (error) throw error

        setComments((prev) =>
          prev
            .filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((r) => r.id !== commentId),
            }))
        )
      } catch (error) {
        console.error("Failed to delete comment:", error)
      }
    },
    []
  )

  // Like comment
  const likeComment = React.useCallback(async (commentId: string) => {
    try {
      await supabase.rpc("increment_comment_likes", { comment_id: commentId })

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : {
                ...comment,
                replies: comment.replies?.map((r) =>
                  r.id === commentId ? { ...r, likes: r.likes + 1 } : r
                ),
              }
        )
      )
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }, [])

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    likeComment,
    totalComments: comments.reduce(
      (acc, c) => acc + 1 + (c.replies?.length || 0),
      0
    ),
  }
}
