import { NextRequest, NextResponse } from "next/server"
import { extractMathFromImage } from "@/lib/ai/ocr"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      )
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    // Extract text and formulas
    const result = await extractMathFromImage(base64)

    return NextResponse.json(result)
  } catch (error) {
    console.error("OCR error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from image" },
      { status: 500 }
    )
  }
}
