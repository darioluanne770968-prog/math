import Bull from "bull"
import { generateMathScript } from "@/lib/ai/openai"
import { generateVideoNarration, uploadAudio } from "@/lib/ai/tts"
import { supabase } from "@/lib/supabase"

// Create video generation queue
export const videoQueue = new Bull("video-generation", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export interface VideoJobData {
  videoId: string
  userId: string
  question: string
  subject: string
  language: string
  attachments?: string[]
}

export interface VideoJobResult {
  videoId: string
  videoUrl: string
  thumbnailUrl: string
  audioUrl: string
  subtitlesUrl: string
  duration: number
}

// Process video generation jobs
videoQueue.process(async (job) => {
  const { videoId, userId, question, subject, language } = job.data as VideoJobData

  try {
    // Update status: generating script
    await updateVideoStatus(videoId, "processing", "Generating script...")
    job.progress(10)

    // Generate script with AI
    const script = await generateMathScript(question, subject, language)
    job.progress(30)

    // Update status: generating audio
    await updateVideoStatus(videoId, "processing", "Generating narration...")

    // Generate audio narration
    const narrationText = [
      { text: script.introduction, pauseAfter: 1 },
      ...script.steps.map((step) => ({
        text: `${step.title}. ${step.content}`,
        pauseAfter: 0.5,
      })),
      { text: script.conclusion, pauseAfter: 0.5 },
    ]

    const { audioBuffer, segments, totalDuration } = await generateVideoNarration(
      narrationText
    )
    job.progress(50)

    // Upload audio
    const audioUrl = await uploadAudio(audioBuffer, `${videoId}.mp3`, userId)
    job.progress(60)

    // Update status: rendering video
    await updateVideoStatus(videoId, "processing", "Rendering video...")

    // TODO: Actually render video with Remotion
    // For now, we'll just create placeholder data
    job.progress(90)

    // Generate subtitles
    const srtContent = segments
      .map(
        (seg, i) =>
          `${i + 1}\n${formatSRTTime(seg.startTime)} --> ${formatSRTTime(seg.endTime)}\n${seg.text}\n`
      )
      .join("\n")

    // Upload subtitles
    const { data: srtData, error: srtError } = await supabase.storage
      .from("subtitles")
      .upload(`${userId}/${videoId}.srt`, srtContent, {
        contentType: "text/plain",
        upsert: true,
      })

    if (srtError) throw srtError

    const { data: { publicUrl: subtitlesUrl } } = supabase.storage
      .from("subtitles")
      .getPublicUrl(srtData.path)

    // Update video record
    await supabase
      .from("videos")
      .update({
        status: "completed",
        audio_url: audioUrl,
        video_url: audioUrl, // Placeholder until Remotion rendering
        thumbnail_url: null,
        duration: totalDuration,
      })
      .eq("id", videoId)

    job.progress(100)

    return {
      videoId,
      videoUrl: audioUrl,
      thumbnailUrl: "",
      audioUrl,
      subtitlesUrl,
      duration: totalDuration,
    }
  } catch (error) {
    console.error("Video generation failed:", error)

    await supabase
      .from("videos")
      .update({
        status: "failed",
      })
      .eq("id", videoId)

    throw error
  }
})

// Event handlers
videoQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result)
  // TODO: Emit WebSocket event
})

videoQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message)
  // TODO: Emit WebSocket event
})

videoQueue.on("progress", (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`)
  // TODO: Emit WebSocket event
})

// Helper functions
async function updateVideoStatus(
  videoId: string,
  status: string,
  message?: string
) {
  await supabase
    .from("videos")
    .update({ status })
    .eq("id", videoId)
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

// Add job to queue
export async function queueVideoGeneration(data: VideoJobData): Promise<string> {
  const job = await videoQueue.add(data, {
    jobId: data.videoId,
  })
  return job.id?.toString() || ""
}

// Get job status
export async function getJobStatus(jobId: string) {
  const job = await videoQueue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  const progress = job.progress()

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
  }
}
