import { NextRequest, NextResponse } from "next/server"
import { bundle } from "@remotion/bundler"
import { renderMedia, selectComposition } from "@remotion/renderer"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, steps, primaryColor = "#10b981" } = body

    if (!title || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: "Title and steps are required" },
        { status: 400 }
      )
    }

    // 生成唯一的视频 ID
    const videoId = uuidv4()
    const outputDir = path.join(process.cwd(), "public", "videos")
    const outputPath = path.join(outputDir, `${videoId}.mp4`)

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Remotion 项目路径
    const remotionEntry = path.join(process.cwd(), "remotion", "index.ts")

    // Bundle Remotion 项目
    const bundled = await bundle({
      entryPoint: remotionEntry,
      webpackOverride: (config) => config,
    })

    // 选择组合
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "MathExplainer",
      inputProps: {
        title,
        steps,
        primaryColor,
      },
    })

    // 渲染视频
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        title,
        steps,
        primaryColor,
      },
    })

    // 返回视频 URL
    const videoUrl = `/videos/${videoId}.mp4`

    return NextResponse.json({
      success: true,
      videoId,
      videoUrl,
    })
  } catch (error) {
    console.error("Video render error:", error)
    return NextResponse.json(
      { error: "Failed to render video", details: String(error) },
      { status: 500 }
    )
  }
}
