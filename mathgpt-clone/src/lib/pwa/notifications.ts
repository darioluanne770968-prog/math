"use client"

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: { action: string; title: string }[]
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null

  async init(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported")
      return false
    }

    try {
      this.swRegistration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error("Service worker registration failed:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  getPermission(): NotificationPermission {
    if (!("Notification" in window)) {
      return "denied"
    }
    return Notification.permission
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.init()
    }

    if (!this.swRegistration) {
      return null
    }

    try {
      // Check for existing subscription
      let subscription = await this.swRegistration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
          console.error("VAPID public key not configured")
          return null
        }

        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
        })
      }

      // Send subscription to server
      await this.saveSubscription(subscription)

      return subscription
    } catch (error) {
      console.error("Failed to subscribe:", error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.deleteSubscription(subscription)
      }
      return true
    } catch (error) {
      console.error("Failed to unsubscribe:", error)
      return false
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.swRegistration) {
      await this.init()
    }

    if (!this.swRegistration) {
      return false
    }

    const subscription = await this.swRegistration.pushManager.getSubscription()
    return subscription !== null
  }

  // Show local notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== "granted") {
      return
    }

    if (this.swRegistration) {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/icons/icon-192x192.png",
        badge: payload.badge || "/icons/badge-72x72.png",
        tag: payload.tag,
        data: payload.data,
      })
    } else {
      // Fallback to basic notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/icons/icon-192x192.png",
        tag: payload.tag,
      })
    }
  }

  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    })
  }

  private async deleteSubscription(subscription: PushSubscription): Promise<void> {
    await fetch("/api/notifications/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

export const notificationService = new NotificationService()

// Predefined notification types
export const notifications = {
  studyReminder: (time: string): NotificationPayload => ({
    title: "Time to Study!",
    body: `Your scheduled study session starts at ${time}`,
    tag: "study-reminder",
    data: { url: "/practice" },
  }),

  streakWarning: (streak: number): NotificationPayload => ({
    title: "Don't Break Your Streak!",
    body: `You have a ${streak}-day streak. Practice today to keep it going!`,
    tag: "streak-warning",
    data: { url: "/practice" },
  }),

  achievementUnlocked: (name: string): NotificationPayload => ({
    title: "Achievement Unlocked! 🏆",
    body: `You earned: ${name}`,
    tag: "achievement",
    data: { url: "/profile" },
  }),

  newContent: (topic: string): NotificationPayload => ({
    title: "New Lessons Available",
    body: `New ${topic} content has been added!`,
    tag: "new-content",
    data: { url: "/gallery" },
  }),

  groupMessage: (groupName: string, sender: string): NotificationPayload => ({
    title: groupName,
    body: `${sender} sent a message`,
    tag: `group-${groupName}`,
    data: { url: "/groups" },
  }),

  questionAnswered: (questionTitle: string): NotificationPayload => ({
    title: "Your Question Was Answered",
    body: questionTitle.substring(0, 50) + "...",
    tag: "qa",
    data: { url: "/community" },
  }),
}
