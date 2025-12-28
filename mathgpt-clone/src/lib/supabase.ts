import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Video, Chat } from "@/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Only create a real client if we have actual credentials
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export async function getVideos(userId?: string, limit = 20, offset = 0) {
  let query = supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Video[]
}

export async function getVideo(id: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data as Video
}

export async function createVideo(video: Omit<Video, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("videos")
    .insert(video)
    .select()
    .single()

  if (error) throw error
  return data as Video
}

export async function updateVideo(
  id: string,
  updates: Partial<Omit<Video, "id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("videos")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Video
}

export async function deleteVideo(id: string) {
  const { error } = await supabase.from("videos").delete().eq("id", id)
  if (error) throw error
}

export async function getChats(userId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Chat[]
}

export async function createChat(chat: Omit<Chat, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("chats")
    .insert(chat)
    .select()
    .single()

  if (error) throw error
  return data as Chat
}

export async function updateChat(
  id: string,
  updates: Partial<Omit<Chat, "id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Chat
}
