import { NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, subject = "math", language = "en" } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    const response = await generateChatResponse(messages, subject, language)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
