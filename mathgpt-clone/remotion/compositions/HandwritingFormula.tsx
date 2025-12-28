import React from "react"
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion"

interface HandwritingFormulaProps {
  formula: string
  color?: string
  fontSize?: number
  strokeWidth?: number
}

export const HandwritingFormula: React.FC<HandwritingFormulaProps> = ({
  formula,
  color = "#10b981",
  fontSize = 48,
  strokeWidth = 3,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Calculate stroke dash offset for handwriting effect
  const progress = interpolate(frame, [0, durationInFrames * 0.8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  })

  // SVG path length (estimated)
  const pathLength = 1000

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
          position: "relative",
          padding: 40,
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        {/* Formula text with handwriting effect */}
        <svg
          width="800"
          height="200"
          viewBox="0 0 800 200"
          style={{ overflow: "visible" }}
        >
          <defs>
            <mask id="revealMask">
              <rect
                x="0"
                y="0"
                width={800 * progress}
                height="200"
                fill="white"
              />
            </mask>
          </defs>

          {/* Main formula text */}
          <text
            x="400"
            y="120"
            textAnchor="middle"
            fill={color}
            fontSize={fontSize}
            fontFamily="serif"
            style={{
              mask: "url(#revealMask)",
            }}
          >
            {formula}
          </text>

          {/* Animated pen cursor */}
          {progress < 1 && (
            <circle
              cx={50 + 700 * progress}
              cy={100 + Math.sin(progress * Math.PI * 4) * 10}
              r={8}
              fill={color}
              style={{
                filter: `drop-shadow(0 0 10px ${color})`,
              }}
            />
          )}
        </svg>

        {/* Underline animation */}
        <svg
          width="800"
          height="20"
          viewBox="0 0 800 20"
          style={{
            marginTop: 10,
            opacity: interpolate(frame, [durationInFrames * 0.7, durationInFrames * 0.9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <line
            x1="100"
            y1="10"
            x2={100 + 600 * interpolate(
              frame,
              [durationInFrames * 0.7, durationInFrames * 0.95],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )}
            y2="10"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  )
}

// Component for animating multiple formulas in sequence
interface FormulaSequenceProps {
  formulas: string[]
  color?: string
}

export const FormulaSequence: React.FC<FormulaSequenceProps> = ({
  formulas,
  color = "#10b981",
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const formulaDuration = durationInFrames / formulas.length
  const currentFormulaIndex = Math.min(
    Math.floor(frame / formulaDuration),
    formulas.length - 1
  )

  const localFrame = frame - currentFormulaIndex * formulaDuration
  const localProgress = interpolate(localFrame, [0, formulaDuration * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginBottom: 40,
          }}
        >
          {formulas.map((_, index) => (
            <div
              key={index}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  index <= currentFormulaIndex ? color : "#333",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>

        {/* Current formula with reveal effect */}
        <div
          style={{
            fontSize: 56,
            fontFamily: "serif",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "inline-block",
              clipPath: `inset(0 ${100 - localProgress * 100}% 0 0)`,
            }}
          >
            {formulas[currentFormulaIndex]}
          </span>
        </div>

        {/* Previous formulas (faded) */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: 0.4,
          }}
        >
          {formulas.slice(0, currentFormulaIndex).map((formula, index) => (
            <div
              key={index}
              style={{
                fontSize: 24,
                fontFamily: "serif",
                color: "#888",
              }}
            >
              {formula}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}
