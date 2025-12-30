import { NextRequest, NextResponse } from "next/server"
import { generateSolution } from "@/lib/ai/solver"

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
    const { problem, format = "latex" } = body

    if (!problem) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "problem is required",
        },
        { status: 400 }
      )
    }

    const solution = await generateSolution(problem)

    return NextResponse.json({
      success: true,
      problem: solution.problem,
      steps: solution.steps,
      finalAnswer: solution.finalAnswer,
      concepts: solution.concepts,
      difficulty: solution.difficulty,
    })
  } catch (error) {
    console.error("Problem solving error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to solve problem" },
      { status: 500 }
    )
  }
}
