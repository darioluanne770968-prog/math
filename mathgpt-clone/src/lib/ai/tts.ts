import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"

export interface TTSOptions {
  voice?: Voice
  speed?: number // 0.25 to 4.0
  format?: "mp3" | "opus" | "aac" | "flac"
}

export interface AudioSegment {
  text: string
  startTime: number
  endTime: number
  audioUrl: string
}

// Generate speech from text
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> {
  const { voice = "nova", speed = 1.0, format = "mp3" } = options

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice,
    input: text,
    speed,
    response_format: format,
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Generate speech for video script with timing
export async function generateVideoNarration(
  script: { text: string; pauseAfter?: number }[],
  options: TTSOptions = {}
): Promise<{
  audioBuffer: Buffer
  segments: AudioSegment[]
  totalDuration: number
}> {
  const segments: AudioSegment[] = []
  const audioBuffers: Buffer[] = []
  let currentTime = 0

  for (const segment of script) {
    const audioBuffer = await generateSpeech(segment.text, options)
    audioBuffers.push(audioBuffer)

    // Estimate duration (rough estimate: 150 words per minute)
    const wordCount = segment.text.split(/\s+/).length
    const estimatedDuration = (wordCount / 150) * 60

    segments.push({
      text: segment.text,
      startTime: currentTime,
      endTime: currentTime + estimatedDuration,
      audioUrl: "", // Will be filled after upload
    })

    currentTime += estimatedDuration + (segment.pauseAfter || 0.5)
  }

  // Combine audio buffers
  const combinedBuffer = Buffer.concat(audioBuffers)

  return {
    audioBuffer: combinedBuffer,
    segments,
    totalDuration: currentTime,
  }
}

// Upload audio to Supabase Storage
export async function uploadAudio(
  audioBuffer: Buffer,
  filename: string,
  userId: string
): Promise<string> {
  const path = `audio/${userId}/${filename}`

  const { data, error } = await supabase.storage
    .from("audio")
    .upload(path, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from("audio").getPublicUrl(data.path)

  return publicUrl
}

// Generate SRT subtitles from segments
export function generateSRT(segments: AudioSegment[]): string {
  return segments
    .map((segment, index) => {
      const startTime = formatSRTTime(segment.startTime)
      const endTime = formatSRTTime(segment.endTime)
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`
    })
    .join("\n")
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`
}

// Get available voices with descriptions
export function getAvailableVoices(): {
  id: Voice
  name: string
  description: string
  gender: "male" | "female" | "neutral"
}[] {
  return [
    { id: "alloy", name: "Alloy", description: "Neutral and balanced", gender: "neutral" },
    { id: "echo", name: "Echo", description: "Warm and conversational", gender: "male" },
    { id: "fable", name: "Fable", description: "British accent, expressive", gender: "neutral" },
    { id: "onyx", name: "Onyx", description: "Deep and authoritative", gender: "male" },
    { id: "nova", name: "Nova", description: "Friendly and natural", gender: "female" },
    { id: "shimmer", name: "Shimmer", description: "Clear and professional", gender: "female" },
  ]
}
