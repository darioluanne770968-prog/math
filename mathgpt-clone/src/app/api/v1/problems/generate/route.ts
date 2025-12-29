import { NextRequest, NextResponse } from "next/server"
import { generateProblems } from "@/lib/ai/problemGenerator"

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
    const { topic, difficulty, count = 5, includeMultipleChoice = false } = body

    if (!topic || !difficulty) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "topic and difficulty are required",
        },
        { status: 400 }
      )
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "difficulty must be easy, medium, or hard",
        },
        { status: 400 }
      )
    }

    const problems = await generateProblems({
      topic,
      difficulty,
      count: Math.min(count, 20), // Max 20 problems
      includeMultipleChoice,
    })

    return NextResponse.json({
      success: true,
      count: problems.length,
      problems,
    })
  } catch (error) {
    console.error("Problem generation error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to generate problems" },
      { status: 500 }
    )
  }
}
