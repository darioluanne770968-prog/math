"use client"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
})

export interface GeneratedProblem {
  id: string
  question: string
  options?: string[]
  answer: string
  solution: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
  subtopic: string
  hints: string[]
}

export interface ProblemGenerationOptions {
  topic: string
  subtopic?: string
  difficulty: "easy" | "medium" | "hard"
  count: number
  includeMultipleChoice?: boolean
  userLevel?: number // 1-10 scale
}

export async function generateProblems(
  options: ProblemGenerationOptions
): Promise<GeneratedProblem[]> {
  const { topic, subtopic, difficulty, count, includeMultipleChoice, userLevel } = options

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a math problem generator. Create ${count} ${difficulty} problems about ${topic}${subtopic ? ` (${subtopic})` : ""}.
${userLevel ? `The student's level is ${userLevel}/10.` : ""}
Return JSON array:
[
  {
    "id": "unique_id",
    "question": "problem statement with LaTeX",
    ${includeMultipleChoice ? '"options": ["A) ...", "B) ...", "C) ...", "D) ..."],' : ""}
    "answer": "correct answer",
    "solution": "step-by-step solution",
    "difficulty": "${difficulty}",
    "topic": "${topic}",
    "subtopic": "specific subtopic",
    "hints": ["hint 1", "hint 2", "hint 3"]
  }
]`,
      },
      {
        role: "user",
        content: `Generate ${count} ${difficulty} ${topic} problems${subtopic ? ` about ${subtopic}` : ""}.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  })

  const content = response.choices[0].message.content || "[]"
  const parsed = JSON.parse(content)
  return Array.isArray(parsed) ? parsed : parsed.problems || []
}

export async function generateAdaptiveProblem(
  topic: string,
  userPerformance: { correct: number; total: number; recentDifficulty: string }
): Promise<GeneratedProblem> {
  const successRate = userPerformance.total > 0 ? userPerformance.correct / userPerformance.total : 0.5

  let targetDifficulty: "easy" | "medium" | "hard"
  if (successRate > 0.8) {
    targetDifficulty = userPerformance.recentDifficulty === "hard" ? "hard" :
                       userPerformance.recentDifficulty === "medium" ? "hard" : "medium"
  } else if (successRate > 0.5) {
    targetDifficulty = "medium"
  } else {
    targetDifficulty = userPerformance.recentDifficulty === "easy" ? "easy" :
                       userPerformance.recentDifficulty === "medium" ? "easy" : "medium"
  }

  const problems = await generateProblems({
    topic,
    difficulty: targetDifficulty,
    count: 1,
  })

  return problems[0]
}

export const mathTopics = {
  algebra: {
    name: "Algebra",
    subtopics: [
      "Linear Equations",
      "Quadratic Equations",
      "Systems of Equations",
      "Inequalities",
      "Polynomials",
      "Factoring",
      "Exponents",
      "Logarithms",
    ],
  },
  geometry: {
    name: "Geometry",
    subtopics: [
      "Triangles",
      "Circles",
      "Polygons",
      "Area and Perimeter",
      "Volume",
      "Coordinate Geometry",
      "Transformations",
      "Proofs",
    ],
  },
  calculus: {
    name: "Calculus",
    subtopics: [
      "Limits",
      "Derivatives",
      "Integrals",
      "Chain Rule",
      "Product Rule",
      "Integration by Parts",
      "Differential Equations",
      "Series",
    ],
  },
  trigonometry: {
    name: "Trigonometry",
    subtopics: [
      "Trigonometric Functions",
      "Trigonometric Identities",
      "Inverse Trigonometry",
      "Law of Sines",
      "Law of Cosines",
      "Radians",
      "Unit Circle",
    ],
  },
  statistics: {
    name: "Statistics",
    subtopics: [
      "Mean, Median, Mode",
      "Standard Deviation",
      "Probability",
      "Distributions",
      "Hypothesis Testing",
      "Regression",
      "Correlation",
    ],
  },
  physics: {
    name: "Physics",
    subtopics: [
      "Kinematics",
      "Forces",
      "Energy",
      "Momentum",
      "Waves",
      "Electricity",
      "Magnetism",
      "Thermodynamics",
    ],
  },
  chemistry: {
    name: "Chemistry",
    subtopics: [
      "Stoichiometry",
      "Balancing Equations",
      "Molarity",
      "Gas Laws",
      "Atomic Structure",
      "Periodic Trends",
      "Bonding",
      "Thermochemistry",
    ],
  },
}

export function getRandomTopic(): { topic: string; subtopic: string } {
  const topicKeys = Object.keys(mathTopics) as (keyof typeof mathTopics)[]
  const randomTopic = topicKeys[Math.floor(Math.random() * topicKeys.length)]
  const subtopics = mathTopics[randomTopic].subtopics
  const randomSubtopic = subtopics[Math.floor(Math.random() * subtopics.length)]

  return {
    topic: mathTopics[randomTopic].name,
    subtopic: randomSubtopic,
  }
}
