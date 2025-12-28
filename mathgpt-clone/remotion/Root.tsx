import React from "react"
import { Composition } from "remotion"
import { MathExplainer } from "./compositions/MathExplainer"

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

// Default props for preview
const defaultProps: MathExplainerProps = {
  title: "How to Solve Quadratic Equations",
  steps: [
    {
      title: "Identify the Equation",
      content:
        "A quadratic equation has the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0.",
      formula: "ax² + bx + c = 0",
    },
    {
      title: "Apply the Quadratic Formula",
      content:
        "The quadratic formula gives us the solutions for x. It uses the coefficients a, b, and c from the equation.",
      formula: "x = (-b ± √(b² - 4ac)) / 2a",
    },
    {
      title: "Calculate the Discriminant",
      content:
        "The discriminant (b² - 4ac) tells us about the nature of the roots. If positive, we have two real solutions.",
      formula: "Δ = b² - 4ac",
    },
    {
      title: "Find the Solutions",
      content:
        "Substitute the values and calculate both solutions using the plus and minus signs.",
      formula: "x₁ = (-b + √Δ) / 2a, x₂ = (-b - √Δ) / 2a",
    },
  ],
  primaryColor: "#10b981",
}

// Wrapper component to satisfy Remotion's type requirements
const MathExplainerWrapper: React.FC<Record<string, unknown>> = (props) => {
  return <MathExplainer {...(props as unknown as MathExplainerProps)} />
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MathExplainer"
        component={MathExplainerWrapper}
        durationInFrames={90 + defaultProps.steps.length * 150 + 60}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  )
}
