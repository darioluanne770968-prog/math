import Tesseract from "tesseract.js"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OCRResult {
  text: string
  formulas: string[]
  confidence: number
}

// Basic OCR using Tesseract.js
export async function extractTextFromImage(
  imageBuffer: Buffer | string
): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageBuffer, "eng+equ", {
    logger: (m) => console.log(m),
  })

  return {
    text: result.data.text,
    formulas: extractFormulas(result.data.text),
    confidence: result.data.confidence,
  }
}

// Advanced OCR using GPT-4 Vision for math formulas
export async function extractMathFromImage(
  imageBase64: string
): Promise<{
  text: string
  formulas: string[]
  latexFormulas: string[]
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this image and extract:
1. All visible text
2. All mathematical formulas (convert to LaTeX format)
3. Any equations or expressions

Respond in JSON format:
{
  "text": "extracted text",
  "formulas": ["formula1", "formula2"],
  "latexFormulas": ["\\\\frac{1}{2}", "x^2 + y^2 = z^2"]
}`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("No response from vision API")
  }

  return JSON.parse(content)
}

// Extract potential formulas from text
function extractFormulas(text: string): string[] {
  const formulaPatterns = [
    /\$[^$]+\$/g, // LaTeX inline
    /\$\$[^$]+\$\$/g, // LaTeX display
    /[a-zA-Z]\s*[=<>≤≥≠]\s*[0-9a-zA-Z+\-*/^()]+/g, // Simple equations
    /∫|∑|∏|√|∞|π|θ|α|β|γ|δ|ε/g, // Math symbols
  ]

  const formulas: string[] = []
  for (const pattern of formulaPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      formulas.push(...matches)
    }
  }

  return [...new Set(formulas)]
}

// Extract text from PDF (first page)
export async function extractTextFromPDF(
  pdfBuffer: Buffer
): Promise<string> {
  // For PDF, we'll use GPT-4 Vision by converting to image
  // In production, you'd use pdf.js or similar
  const base64 = pdfBuffer.toString("base64")

  const result = await extractMathFromImage(base64)
  return result.text
}
