"use client"

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionResultItem {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionAPI {
  new (): SpeechRecognitionInstance
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null
  private isListening: boolean = false

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = (window as Window & {
        SpeechRecognition?: SpeechRecognitionAPI
        webkitSpeechRecognition?: SpeechRecognitionAPI
      }).SpeechRecognition || (window as Window & {
        SpeechRecognition?: SpeechRecognitionAPI
        webkitSpeechRecognition?: SpeechRecognitionAPI
      }).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI()
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  start(options: SpeechRecognitionOptions = {}): void {
    if (!this.recognition) {
      options.onError?.("Speech recognition not supported")
      return
    }

    if (this.isListening) {
      this.stop()
    }

    this.recognition.lang = options.language || "en-US"
    this.recognition.continuous = options.continuous || false
    this.recognition.interimResults = options.interimResults || true

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      const confidence = result[0].confidence

      options.onResult?.({
        transcript,
        confidence,
        isFinal: result.isFinal,
      })
    }

    this.recognition.onerror = (event) => {
      options.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      options.onEnd?.()
    }

    this.recognition.start()
    this.isListening = true
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }
}

export const speechRecognition = new SpeechRecognitionService()

// Math-specific speech processing
export function processMathSpeech(transcript: string): string {
  let processed = transcript.toLowerCase()

  // Number words to digits
  const numberWords: Record<string, string> = {
    zero: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
  }

  for (const [word, digit] of Object.entries(numberWords)) {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, "gi"), digit)
  }

  // Math operations
  const mathReplacements: Record<string, string> = {
    plus: "+",
    minus: "-",
    times: "*",
    "multiplied by": "*",
    "divided by": "/",
    over: "/",
    equals: "=",
    "is equal to": "=",
    squared: "^2",
    cubed: "^3",
    "to the power of": "^",
    "square root of": "sqrt(",
    "cube root of": "cbrt(",
    pi: "π",
    theta: "θ",
    alpha: "α",
    beta: "β",
    delta: "Δ",
    sigma: "Σ",
    infinity: "∞",
    "greater than": ">",
    "less than": "<",
    "greater than or equal to": "≥",
    "less than or equal to": "≤",
    "not equal to": "≠",
    integral: "∫",
    derivative: "d/dx",
    sum: "Σ",
    product: "∏",
    "x squared": "x^2",
    "x cubed": "x^3",
    sine: "sin",
    cosine: "cos",
    tangent: "tan",
    "log of": "log(",
    "natural log of": "ln(",
    "e to the": "e^",
    factorial: "!",
    percent: "%",
    "open parenthesis": "(",
    "close parenthesis": ")",
    "open bracket": "[",
    "close bracket": "]",
  }

  for (const [phrase, symbol] of Object.entries(mathReplacements)) {
    processed = processed.replace(new RegExp(phrase, "gi"), symbol)
  }

  // Clean up spacing
  processed = processed.replace(/\s+/g, " ").trim()

  return processed
}

// Convert processed speech to LaTeX
export function speechToLatex(processed: string): string {
  let latex = processed

  // Basic operators to LaTeX
  latex = latex.replace(/sqrt\(/g, "\\sqrt{")
  latex = latex.replace(/cbrt\(/g, "\\sqrt[3]{")
  latex = latex.replace(/\^(\d+)/g, "^{$1}")
  latex = latex.replace(/\*/g, "\\times ")
  latex = latex.replace(/\//g, "\\div ")
  latex = latex.replace(/π/g, "\\pi ")
  latex = latex.replace(/θ/g, "\\theta ")
  latex = latex.replace(/α/g, "\\alpha ")
  latex = latex.replace(/β/g, "\\beta ")
  latex = latex.replace(/Δ/g, "\\Delta ")
  latex = latex.replace(/Σ/g, "\\sum ")
  latex = latex.replace(/∏/g, "\\prod ")
  latex = latex.replace(/∞/g, "\\infty ")
  latex = latex.replace(/≥/g, "\\geq ")
  latex = latex.replace(/≤/g, "\\leq ")
  latex = latex.replace(/≠/g, "\\neq ")
  latex = latex.replace(/∫/g, "\\int ")

  // Fractions (simple case: a/b)
  latex = latex.replace(/(\d+)\s*\\div\s*(\d+)/g, "\\frac{$1}{$2}")

  return latex
}
