import { NextRequest, NextResponse } from "next/server"
import { generateMathScript } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, subject = "math", language = "zh" } = body

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      )
    }

    // Generate script using OpenAI
    const script = await generateMathScript(question, subject, language)

    return NextResponse.json({
      success: true,
      script,
    })
  } catch (error) {
    console.error("Explain API error:", error)
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    )
  }
}
