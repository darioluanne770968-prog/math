import { NextRequest, NextResponse } from "next/server"
import { webhookService, WebhookEvent } from "@/lib/webhooks"

export async function GET(request: NextRequest) {
  // Check API key
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "API key required" },
      { status: 401 }
    )
  }

  const webhooks = webhookService.getWebhooks()

  return NextResponse.json({
    success: true,
    webhooks: webhooks.map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events,
      active: w.active,
      createdAt: w.createdAt,
    })),
  })
}

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
    const { url, secret, events } = body

    if (!url || !secret || !events || !Array.isArray(events)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "url, secret, and events array are required",
        },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid URL" },
        { status: 400 }
      )
    }

    // Validate events
    const validEvents: WebhookEvent[] = [
      "user.created",
      "user.updated",
      "video.created",
      "video.completed",
      "problem.solved",
      "achievement.unlocked",
      "streak.updated",
      "level.up",
      "group.joined",
      "question.asked",
      "question.answered",
    ]

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Invalid events: ${invalidEvents.join(", ")}`,
          validEvents,
        },
        { status: 400 }
      )
    }

    const webhook = webhookService.registerWebhook({
      url,
      secret,
      events,
      active: true,
    })

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        createdAt: webhook.createdAt,
      },
    })
  } catch (error) {
    console.error("Webhook registration error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to register webhook" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "API key required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Webhook ID required" },
        { status: 400 }
      )
    }

    const deleted = webhookService.unregisterWebhook(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Not Found", message: "Webhook not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Webhook deleted",
    })
  } catch (error) {
    console.error("Webhook deletion error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete webhook" },
      { status: 500 }
    )
  }
}
