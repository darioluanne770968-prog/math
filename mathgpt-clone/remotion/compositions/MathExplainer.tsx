import React from "react"
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion"

interface Step {
  title: string
  content: string
  formula?: string
}

interface MathExplainerProps {
  title: string
  steps: Step[]
  primaryColor?: string
}

const STEP_DURATION = 150 // frames per step (5 seconds at 30fps)

export const MathExplainer: React.FC<MathExplainerProps> = ({
  title,
  steps,
  primaryColor = "#10b981",
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Title Sequence */}
      <Sequence durationInFrames={90}>
        <TitleCard title={title} primaryColor={primaryColor} />
      </Sequence>

      {/* Step Sequences */}
      {steps.map((step, index) => (
        <Sequence
          key={index}
          from={90 + index * STEP_DURATION}
          durationInFrames={STEP_DURATION}
        >
          <StepCard
            step={step}
            stepNumber={index + 1}
            primaryColor={primaryColor}
          />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={90 + steps.length * STEP_DURATION} durationInFrames={60}>
        <OutroCard primaryColor={primaryColor} />
      </Sequence>
    </AbsoluteFill>
  )
}

const TitleCard: React.FC<{ title: string; primaryColor: string }> = ({
  title,
  primaryColor,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  })

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
    },
  })

  const titleY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) translateY(${titleY}px)`,
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: primaryColor,
            marginBottom: 20,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          MATHGPT EXPLAINS
        </div>
        <h1
          style={{
            fontSize: 56,
            color: "#ffffff",
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 800,
          }}
        >
          {title}
        </h1>
      </div>
    </AbsoluteFill>
  )
}

const StepCard: React.FC<{
  step: Step
  stepNumber: number
  primaryColor: string
}> = ({ step, stepNumber, primaryColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const slideIn = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
    },
  })

  const contentOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  })

  const formulaScale = spring({
    frame: frame - 40,
    fps,
    config: {
      damping: 200,
      stiffness: 80,
    },
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          transform: `translateX(${interpolate(slideIn, [0, 1], [-100, 0])}px)`,
          opacity: slideIn,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* Step Number */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#ffffff",
              marginRight: 20,
            }}
          >
            {stepNumber}
          </div>
          <h2
            style={{
              fontSize: 36,
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            {step.title}
          </h2>
        </div>

        {/* Content */}
        <div
          style={{
            opacity: contentOpacity,
            fontSize: 24,
            color: "#a1a1aa",
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          {step.content}
        </div>

        {/* Formula */}
        {step.formula && (
          <div
            style={{
              transform: `scale(${Math.max(0, formulaScale)})`,
              backgroundColor: "#1a1a1a",
              padding: "30px 50px",
              borderRadius: 16,
              border: `2px solid ${primaryColor}40`,
            }}
          >
            <div
              style={{
                fontSize: 36,
                color: "#ffffff",
                fontFamily: "serif",
                textAlign: "center",
              }}
            >
              {step.formula}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

const OutroCard: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
    },
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 auto 30px",
          }}
        >
          M
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          Created with MathGPT
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#71717a",
            marginTop: 10,
          }}
        >
          Learn more at mathgpt.com
        </div>
      </div>
    </AbsoluteFill>
  )
}
