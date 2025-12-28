"use client"

import React from "react"
import { Player } from "@remotion/player"
import { MathExplainer } from "../../../remotion/compositions/MathExplainer"

interface Step {
  title: string
  content: string
  formula?: string
}

interface VideoPlayerProps {
  title: string
  steps: Step[]
  primaryColor?: string
  className?: string
}

export function VideoPlayer({
  title,
  steps,
  primaryColor = "#10b981",
  className,
}: VideoPlayerProps) {
  const durationInFrames = 90 + steps.length * 150 + 60

  return (
    <div className={className}>
      <Player
        component={MathExplainer}
        inputProps={{
          title,
          steps,
          primaryColor,
        }}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{
          width: "100%",
          aspectRatio: "16/9",
        }}
        controls
        autoPlay={false}
      />
    </div>
  )
}
