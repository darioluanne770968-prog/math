import { NextRequest, NextResponse } from "next/server"
import { generateSpeech, type Voice } from "@/lib/ai/tts"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice = "nova" as Voice, speed = 1.0 } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "Text too long. Maximum 4096 characters." },
        { status: 400 }
      )
    }

    const audioBuffer = await generateSpeech(text, { voice, speed })

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("TTS error:", error)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
}
