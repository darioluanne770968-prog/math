"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
            <p className="text-muted-foreground">
              It looks like you&apos;ve lost your internet connection. Some features may be unavailable.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">While offline, you can still:</p>
              <ul className="text-left space-y-1 pl-4">
                <li>• View previously loaded content</li>
                <li>• Access cached lessons</li>
                <li>• Practice with saved problems</li>
                <li>• Review your flashcards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
