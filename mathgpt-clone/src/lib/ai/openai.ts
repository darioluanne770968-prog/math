import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VideoScript {
  title: string
  introduction: string
  steps: {
    title: string
    content: string
    formula?: string
    visualization?: "graph" | "diagram" | "animation" | null
  }[]
  conclusion: string
  estimatedDuration: number // in seconds
}

export async function generateMathScript(
  question: string,
  subject: string = "math",
  language: string = "en"
): Promise<VideoScript> {
  const systemPrompt = `You are an expert ${subject} tutor creating educational video scripts.
Generate clear, step-by-step explanations for students.
Always include relevant formulas in LaTeX format.
Response must be valid JSON matching this structure:
{
  "title": "string",
  "introduction": "string",
  "steps": [{"title": "string", "content": "string", "formula": "LaTeX string or null", "visualization": "graph|diagram|animation|null"}],
  "conclusion": "string",
  "estimatedDuration": number
}
Language: ${language === "zh" ? "Chinese (Simplified)" : "English"}`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("No response from AI")
  }

  return JSON.parse(content) as VideoScript
}

export async function generateChatResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  subject: string = "math",
  language: string = "en"
): Promise<string> {
  const systemPrompt = `You are a helpful ${subject} tutor.
Explain concepts clearly and use LaTeX for formulas (wrap in $..$ for inline or $$...$$ for display).
Be encouraging and patient.
Language: ${language === "zh" ? "Chinese (Simplified)" : "English"}`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0].message.content || "Sorry, I couldn't generate a response."
}

export async function generateTextToSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "nova"
): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice,
    input: text,
    response_format: "mp3",
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const file = new File([new Uint8Array(audioBuffer)], "audio.mp3", { type: "audio/mp3" })

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "en",
  })

  return response.text
}
