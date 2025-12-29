"use client"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
})

export interface ErrorPattern {
  type: string
  description: string
  frequency: number
  examples: string[]
}

export interface ErrorAnalysis {
  commonErrors: ErrorPattern[]
  weakAreas: string[]
  recommendations: string[]
  improvementPlan: {
    topic: string
    priority: "high" | "medium" | "low"
    suggestedResources: string[]
  }[]
}

export interface MistakeRecord {
  problem: string
  userAnswer: string
  correctAnswer: string
  topic: string
  timestamp: Date
}

export async function analyzeMistakes(mistakes: MistakeRecord[]): Promise<ErrorAnalysis> {
  const mistakeSummary = mistakes.map((m) => ({
    problem: m.problem,
    userAnswer: m.userAnswer,
    correctAnswer: m.correctAnswer,
    topic: m.topic,
  }))

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an educational analyst specializing in identifying learning patterns.
Analyze the student's mistakes and return JSON:
{
  "commonErrors": [
    {
      "type": "error type name",
      "description": "what the student does wrong",
      "frequency": number of occurrences,
      "examples": ["example problems"]
    }
  ],
  "weakAreas": ["list of weak topics"],
  "recommendations": ["specific advice"],
  "improvementPlan": [
    {
      "topic": "topic to improve",
      "priority": "high|medium|low",
      "suggestedResources": ["resource suggestions"]
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Analyze these mistakes:\n${JSON.stringify(mistakeSummary, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || "{}"
  return JSON.parse(content) as ErrorAnalysis
}

export async function getSingleMistakeAnalysis(
  problem: string,
  userAnswer: string,
  correctAnswer: string
): Promise<{
  errorType: string
  explanation: string
  conceptToReview: string
  similarProblems: string[]
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Analyze this math mistake and return JSON:
{
  "errorType": "type of error (calculation, conceptual, procedural, etc.)",
  "explanation": "what went wrong and why",
  "conceptToReview": "the concept the student should review",
  "similarProblems": ["3 similar practice problems"]
}`,
      },
      {
        role: "user",
        content: `Problem: ${problem}\nStudent answered: ${userAnswer}\nCorrect answer: ${correctAnswer}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || "{}"
  return JSON.parse(content)
}

export function categorizeError(errorType: string): {
  category: string
  color: string
  icon: string
} {
  const categories: Record<string, { category: string; color: string; icon: string }> = {
    calculation: { category: "Calculation Error", color: "text-yellow-500", icon: "Calculator" },
    conceptual: { category: "Conceptual Error", color: "text-red-500", icon: "Brain" },
    procedural: { category: "Procedural Error", color: "text-orange-500", icon: "ListOrdered" },
    careless: { category: "Careless Mistake", color: "text-blue-500", icon: "AlertCircle" },
    notation: { category: "Notation Error", color: "text-purple-500", icon: "PenTool" },
  }

  const lowerType = errorType.toLowerCase()
  for (const [key, value] of Object.entries(categories)) {
    if (lowerType.includes(key)) {
      return value
    }
  }

  return { category: "Other Error", color: "text-gray-500", icon: "HelpCircle" }
}
