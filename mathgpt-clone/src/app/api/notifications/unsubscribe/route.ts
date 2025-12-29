import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint required" },
        { status: 400 }
      )
    }

    // Remove subscription (in production, delete from database)
    // subscriptions.delete(endpoint)

    return NextResponse.json({
      success: true,
      message: "Subscription removed",
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    )
  }
}
