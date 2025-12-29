import crypto from "crypto"

export interface WebhookConfig {
  id: string
  url: string
  secret: string
  events: WebhookEvent[]
  active: boolean
  createdAt: Date
}

export type WebhookEvent =
  | "user.created"
  | "user.updated"
  | "video.created"
  | "video.completed"
  | "problem.solved"
  | "achievement.unlocked"
  | "streak.updated"
  | "level.up"
  | "group.joined"
  | "question.asked"
  | "question.answered"

export interface WebhookPayload {
  id: string
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

export class WebhookService {
  private webhooks: WebhookConfig[] = []

  registerWebhook(config: Omit<WebhookConfig, "id" | "createdAt">): WebhookConfig {
    const webhook: WebhookConfig = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    this.webhooks.push(webhook)
    return webhook
  }

  unregisterWebhook(id: string): boolean {
    const index = this.webhooks.findIndex((w) => w.id === id)
    if (index !== -1) {
      this.webhooks.splice(index, 1)
      return true
    }
    return false
  }

  getWebhooks(): WebhookConfig[] {
    return this.webhooks.filter((w) => w.active)
  }

  async trigger(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    const relevantWebhooks = this.webhooks.filter(
      (w) => w.active && w.events.includes(event)
    )

    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    await Promise.allSettled(
      relevantWebhooks.map((webhook) => this.sendWebhook(webhook, payload))
    )
  }

  private async sendWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload
  ): Promise<void> {
    const signature = this.generateSignature(payload, webhook.secret)
    const body = JSON.stringify(payload)

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Id": webhook.id,
          "X-Webhook-Event": payload.event,
        },
        body,
      })

      if (!response.ok) {
        console.error(
          `Webhook ${webhook.id} failed with status ${response.status}`
        )
      }
    } catch (error) {
      console.error(`Webhook ${webhook.id} failed:`, error)
    }
  }

  private generateSignature(
    payload: WebhookPayload,
    secret: string
  ): string {
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(JSON.stringify(payload))
    return `sha256=${hmac.digest("hex")}`
  }

  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")}`

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }
}

export const webhookService = new WebhookService()

// Event handlers
export function onUserCreated(userId: string, userData: Record<string, unknown>) {
  webhookService.trigger("user.created", { userId, ...userData })
}

export function onVideoCreated(videoId: string, videoData: Record<string, unknown>) {
  webhookService.trigger("video.created", { videoId, ...videoData })
}

export function onProblemSolved(
  userId: string,
  problemData: { problemId: string; correct: boolean; time: number }
) {
  webhookService.trigger("problem.solved", { userId, ...problemData })
}

export function onAchievementUnlocked(
  userId: string,
  achievement: { id: string; name: string }
) {
  webhookService.trigger("achievement.unlocked", { userId, ...achievement })
}

export function onStreakUpdated(userId: string, streak: number) {
  webhookService.trigger("streak.updated", { userId, streak })
}

export function onLevelUp(userId: string, level: number, xp: number) {
  webhookService.trigger("level.up", { userId, level, xp })
}
