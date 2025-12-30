"use client"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
})

export interface SolutionStep {
  stepNumber: number
  description: string
  formula?: string
  explanation: string
}

export interface Solution {
  problem: string
  steps: SolutionStep[]
  finalAnswer: string
  concepts: string[]
  difficulty: "easy" | "medium" | "hard"
}

export async function generateSolution(problem: string): Promise<Solution> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a math tutor that provides detailed step-by-step solutions.
Return your response as JSON with this structure:
{
  "problem": "the original problem",
  "steps": [
    {
      "stepNumber": 1,
      "description": "What we're doing in this step",
      "formula": "LaTeX formula if applicable",
      "explanation": "Why we do this"
    }
  ],
  "finalAnswer": "The final answer with LaTeX",
  "concepts": ["List of math concepts used"],
  "difficulty": "easy|medium|hard"
}`,
      },
      {
        role: "user",
        content: `Solve this problem step by step: ${problem}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content || "{}"
  return JSON.parse(content) as Solution
}

export async function explainConcept(concept: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a patient math tutor. Explain concepts clearly with examples. Use LaTeX for formulas (wrap in $ or $$).",
      },
      {
        role: "user",
        content: `Explain this concept in simple terms: ${concept}`,
      },
    ],
    temperature: 0.5,
  })

  return response.choices[0].message.content || ""
}

export async function getHint(problem: string, currentStep: number): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a math tutor. Give a helpful hint without revealing the full solution. Be encouraging.",
      },
      {
        role: "user",
        content: `I'm stuck on step ${currentStep} of this problem: ${problem}. Give me a hint.`,
      },
    ],
    temperature: 0.7,
  })

  return response.choices[0].message.content || ""
}

export async function checkAnswer(
  problem: string,
  userAnswer: string
): Promise<{
  correct: boolean
  feedback: string
  correctAnswer?: string
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a math tutor checking student answers.
Return JSON: { "correct": boolean, "feedback": "explanation", "correctAnswer": "if wrong, show correct answer" }`,
      },
      {
        role: "user",
        content: `Problem: ${problem}\nStudent's answer: ${userAnswer}\n\nIs this correct?`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  })

  const content = response.choices[0].message.content || "{}"
  return JSON.parse(content)
}
