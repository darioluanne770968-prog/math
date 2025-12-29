import { NextRequest, NextResponse } from "next/server"
import { checkAnswer } from "@/lib/ai/solver"

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "API key required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { problem, answer } = body

    if (!problem || !answer) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "problem and answer are required",
        },
        { status: 400 }
      )
    }

    const result = await checkAnswer(problem, answer)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Answer checking error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to check answer" },
      { status: 500 }
    )
  }
}
