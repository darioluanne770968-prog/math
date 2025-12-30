import { NextRequest, NextResponse } from "next/server"

// API Documentation endpoint
export async function GET(request: NextRequest) {
  const apiDocs = {
    name: "MathGPT API",
    version: "1.0.0",
    description: "Open API for MathGPT Clone platform",
    baseUrl: "/api/v1",
    authentication: {
      type: "Bearer Token",
      header: "Authorization",
      format: "Bearer <api_key>",
    },
    endpoints: {
      // Problem Generation
      "/problems/generate": {
        method: "POST",
        description: "Generate math problems based on topic and difficulty",
        body: {
          topic: "string (required) - Math topic (algebra, calculus, etc.)",
          difficulty: "string (required) - easy | medium | hard",
          count: "number (optional, default: 5) - Number of problems to generate",
          includeMultipleChoice: "boolean (optional) - Include answer options",
        },
        response: {
          problems: "array - Generated problems with solutions",
        },
      },

      // Problem Solving
      "/solve": {
        method: "POST",
        description: "Get step-by-step solution for a math problem",
        body: {
          problem: "string (required) - The math problem to solve",
          format: "string (optional) - latex | plain",
        },
        response: {
          steps: "array - Solution steps",
          finalAnswer: "string - The final answer",
          concepts: "array - Mathematical concepts used",
        },
      },

      // Check Answer
      "/check": {
        method: "POST",
        description: "Check if an answer is correct",
        body: {
          problem: "string (required) - The problem",
          answer: "string (required) - The answer to check",
        },
        response: {
          correct: "boolean - Whether the answer is correct",
          feedback: "string - Explanation",
          correctAnswer: "string - The correct answer if wrong",
        },
      },

      // OCR
      "/ocr": {
        method: "POST",
        description: "Extract math from an image",
        body: {
          image: "string (required) - Base64 encoded image",
        },
        response: {
          text: "string - Extracted text",
          latex: "string - LaTeX representation",
        },
      },

      // Text to Speech
      "/tts": {
        method: "POST",
        description: "Convert text to speech",
        body: {
          text: "string (required) - Text to convert",
          voice: "string (optional) - Voice model",
          speed: "number (optional) - Playback speed",
        },
        response: "audio/mpeg - Audio file",
      },

      // Video Generation
      "/video/generate": {
        method: "POST",
        description: "Generate educational math video",
        body: {
          title: "string (required) - Video title",
          topic: "string (required) - Math topic",
          steps: "array (required) - Content steps",
          options: {
            style: "string - modern | classic | minimal",
            voiceover: "boolean - Include voice narration",
          },
        },
        response: {
          jobId: "string - Job ID to track progress",
          status: "string - pending | processing | completed | failed",
        },
      },

      // Video Status
      "/video/:jobId": {
        method: "GET",
        description: "Get video generation status",
        response: {
          status: "string - Current status",
          progress: "number - Progress percentage",
          videoUrl: "string - URL when completed",
        },
      },

      // User Stats
      "/users/:userId/stats": {
        method: "GET",
        description: "Get user learning statistics",
        response: {
          totalProblems: "number",
          accuracy: "number",
          streak: "number",
          level: "number",
          topicBreakdown: "object",
        },
      },

      // Leaderboard
      "/leaderboard": {
        method: "GET",
        description: "Get leaderboard data",
        query: {
          period: "string (optional) - daily | weekly | monthly | allTime",
          limit: "number (optional, default: 100)",
        },
        response: {
          entries: "array - Leaderboard entries",
        },
      },

      // Webhooks
      "/webhooks": {
        method: "POST",
        description: "Register a webhook",
        body: {
          url: "string (required) - Webhook URL",
          secret: "string (required) - Signing secret",
          events: "array (required) - Events to subscribe to",
        },
        response: {
          id: "string - Webhook ID",
          active: "boolean",
        },
      },
    },
    webhookEvents: [
      "user.created",
      "user.updated",
      "video.created",
      "video.completed",
      "problem.solved",
      "achievement.unlocked",
      "streak.updated",
      "level.up",
      "group.joined",
      "question.asked",
      "question.answered",
    ],
    rateLimits: {
      default: "100 requests per minute",
      premium: "1000 requests per minute",
      headers: {
        "X-RateLimit-Limit": "Maximum requests allowed",
        "X-RateLimit-Remaining": "Remaining requests",
        "X-RateLimit-Reset": "Unix timestamp when limit resets",
      },
    },
    errors: {
      400: "Bad Request - Invalid parameters",
      401: "Unauthorized - Invalid or missing API key",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource not found",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error",
    },
    sdks: {
      javascript: "npm install @mathgpt/sdk",
      python: "pip install mathgpt",
      curl: "Available via REST API",
    },
  }

  return NextResponse.json(apiDocs, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
