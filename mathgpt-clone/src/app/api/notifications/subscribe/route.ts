import { NextRequest, NextResponse } from "next/server"

// In production, store subscriptions in a database
const subscriptions: Map<string, PushSubscription> = new Map()

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      )
    }

    // Store subscription (in production, save to database)
    subscriptions.set(subscription.endpoint, subscription)

    return NextResponse.json({
      success: true,
      message: "Subscription saved",
    })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    )
  }
}
