import { supabase } from "@/lib/supabase"

// CDN Configuration
const CDN_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || "",
  videoBucket: "videos",
  audioBucket: "audio",
  thumbnailBucket: "thumbnails",
  subtitlesBucket: "subtitles",
}

// File types and their configurations
const MEDIA_CONFIG = {
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ["video/mp4", "video/webm"],
    bucket: CDN_CONFIG.videoBucket,
  },
  audio: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["audio/mpeg", "audio/mp3", "audio/wav"],
    bucket: CDN_CONFIG.audioBucket,
  },
  thumbnail: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    bucket: CDN_CONFIG.thumbnailBucket,
  },
  subtitles: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ["text/plain", "text/vtt", "application/x-subrip"],
    bucket: CDN_CONFIG.subtitlesBucket,
  },
}

export type MediaType = keyof typeof MEDIA_CONFIG

// Upload file to CDN
export async function uploadToCDN(
  file: File | Buffer,
  type: MediaType,
  userId: string,
  filename: string
): Promise<{
  url: string
  path: string
  size: number
}> {
  const config = MEDIA_CONFIG[type]

  // Validate file size if it's a File
  if (file instanceof File && file.size > config.maxSize) {
    throw new Error(
      `File too large. Maximum size is ${config.maxSize / 1024 / 1024}MB`
    )
  }

  // Validate file type if it's a File
  if (file instanceof File && !config.allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${config.allowedTypes.join(", ")}`)
  }

  const path = `${userId}/${Date.now()}-${filename}`

  const { data, error } = await supabase.storage
    .from(config.bucket)
    .upload(path, file, {
      cacheControl: "31536000", // 1 year cache
      upsert: true,
    })

  if (error) throw error

  // Get public URL (use CDN if configured)
  let url: string
  if (CDN_CONFIG.baseUrl) {
    url = `${CDN_CONFIG.baseUrl}/${config.bucket}/${data.path}`
  } else {
    const { data: urlData } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(data.path)
    url = urlData.publicUrl
  }

  return {
    url,
    path: data.path,
    size: file instanceof File ? file.size : (file as Buffer).length,
  }
}

// Delete file from CDN
export async function deleteFromCDN(path: string, bucket: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

// Get signed URL for private files
export async function getSignedUrl(
  path: string,
  bucket: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

// Generate thumbnail from video
export async function generateThumbnail(
  videoUrl: string,
  timestamp: number = 1
): Promise<Buffer> {
  // In production, you would use ffmpeg or a cloud service
  // For now, return a placeholder
  throw new Error("Thumbnail generation not implemented")
}

// Get optimized video URL for streaming
export function getStreamingUrl(videoPath: string): string {
  if (CDN_CONFIG.baseUrl) {
    return `${CDN_CONFIG.baseUrl}/${CDN_CONFIG.videoBucket}/${videoPath}`
  }

  const { data } = supabase.storage
    .from(CDN_CONFIG.videoBucket)
    .getPublicUrl(videoPath)

  return data.publicUrl
}

// Calculate CDN usage
export async function getCDNUsage(userId: string): Promise<{
  totalSize: number
  videoSize: number
  audioSize: number
  thumbnailSize: number
}> {
  const buckets = [
    { name: CDN_CONFIG.videoBucket, key: "videoSize" },
    { name: CDN_CONFIG.audioBucket, key: "audioSize" },
    { name: CDN_CONFIG.thumbnailBucket, key: "thumbnailSize" },
  ]

  const usage: Record<string, number> = {
    videoSize: 0,
    audioSize: 0,
    thumbnailSize: 0,
  }

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage
      .from(bucket.name)
      .list(userId)

    if (!error && data) {
      usage[bucket.key] = data.reduce(
        (acc, file) => acc + (file.metadata?.size || 0),
        0
      )
    }
  }

  return {
    totalSize: usage.videoSize + usage.audioSize + usage.thumbnailSize,
    videoSize: usage.videoSize,
    audioSize: usage.audioSize,
    thumbnailSize: usage.thumbnailSize,
  }
}
