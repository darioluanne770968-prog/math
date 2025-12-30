"use client"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
})

export interface Subtitle {
  id: number
  startTime: number // seconds
  endTime: number
  text: string
}

export interface SubtitleTrack {
  language: string
  label: string
  subtitles: Subtitle[]
}

// Generate subtitles from audio using Whisper
export async function generateSubtitlesFromAudio(
  audioBuffer: ArrayBuffer
): Promise<Subtitle[]> {
  const file = new File([new Uint8Array(audioBuffer)], "audio.mp3", {
    type: "audio/mp3",
  })

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  })

  const subtitles: Subtitle[] = []

  if ('segments' in response && Array.isArray(response.segments)) {
    response.segments.forEach((segment: { start: number; end: number; text: string }, index: number) => {
      subtitles.push({
        id: index + 1,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text.trim(),
      })
    })
  }

  return subtitles
}

// Generate subtitles from script text with timing
export async function generateSubtitlesFromScript(
  script: string,
  totalDuration: number
): Promise<Subtitle[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a subtitle generator. Given a script and total duration, create timed subtitles.
Each subtitle should be 3-7 seconds long and contain 1-2 sentences.
Return JSON array:
[
  { "id": 1, "startTime": 0, "endTime": 5, "text": "First subtitle text" },
  { "id": 2, "startTime": 5, "endTime": 10, "text": "Second subtitle text" }
]
Total duration: ${totalDuration} seconds`,
      },
      {
        role: "user",
        content: script,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || "[]"
  const parsed = JSON.parse(content)
  return Array.isArray(parsed) ? parsed : parsed.subtitles || []
}

// Convert subtitles to WebVTT format
export function toWebVTT(subtitles: Subtitle[]): string {
  let vtt = "WEBVTT\n\n"

  subtitles.forEach((sub) => {
    const startFormatted = formatTime(sub.startTime)
    const endFormatted = formatTime(sub.endTime)
    vtt += `${sub.id}\n`
    vtt += `${startFormatted} --> ${endFormatted}\n`
    vtt += `${sub.text}\n\n`
  })

  return vtt
}

// Convert subtitles to SRT format
export function toSRT(subtitles: Subtitle[]): string {
  let srt = ""

  subtitles.forEach((sub) => {
    const startFormatted = formatTimeSRT(sub.startTime)
    const endFormatted = formatTimeSRT(sub.endTime)
    srt += `${sub.id}\n`
    srt += `${startFormatted} --> ${endFormatted}\n`
    srt += `${sub.text}\n\n`
  })

  return srt
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
}

function formatTimeSRT(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

// Translate subtitles to another language
export async function translateSubtitles(
  subtitles: Subtitle[],
  targetLanguage: string
): Promise<Subtitle[]> {
  const textsToTranslate = subtitles.map((s) => s.text)

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Translate the following subtitle texts to ${targetLanguage}.
Keep the same order and return only the translated texts as a JSON array of strings.`,
      },
      {
        role: "user",
        content: JSON.stringify(textsToTranslate),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || "[]"
  const parsed = JSON.parse(content)
  const translations: string[] = Array.isArray(parsed)
    ? parsed
    : parsed.translations || []

  return subtitles.map((sub, index) => ({
    ...sub,
    text: translations[index] || sub.text,
  }))
}

// Parse SRT file content
export function parseSRT(srtContent: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const blocks = srtContent.trim().split(/\n\n+/)

  blocks.forEach((block) => {
    const lines = block.split("\n")
    if (lines.length >= 3) {
      const id = parseInt(lines[0], 10)
      const timeParts = lines[1].split(" --> ")
      const startTime = parseSRTTime(timeParts[0])
      const endTime = parseSRTTime(timeParts[1])
      const text = lines.slice(2).join(" ")

      subtitles.push({ id, startTime, endTime, text })
    }
  })

  return subtitles
}

function parseSRTTime(timeStr: string): number {
  const [time, ms] = timeStr.split(",")
  const [h, m, s] = time.split(":").map(Number)
  return h * 3600 + m * 60 + s + parseInt(ms, 10) / 1000
}
