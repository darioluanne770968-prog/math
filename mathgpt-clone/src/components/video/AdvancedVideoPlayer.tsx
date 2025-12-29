"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  SkipBack,
  SkipForward,
  PictureInPicture,
  List,
} from "lucide-react"

export interface Chapter {
  id: string
  title: string
  startTime: number
  endTime: number
  thumbnail?: string
}

export interface SubtitleCue {
  startTime: number
  endTime: number
  text: string
}

interface AdvancedVideoPlayerProps {
  src: string
  poster?: string
  chapters?: Chapter[]
  subtitles?: SubtitleCue[]
  onTimeUpdate?: (currentTime: number) => void
  onChapterChange?: (chapterId: string) => void
  onProgress?: (progress: number) => void
}

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function AdvancedVideoPlayer({
  src,
  poster,
  chapters = [],
  subtitles = [],
  onTimeUpdate,
  onChapterChange,
  onProgress,
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("")
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const container = containerRef.current
    container?.addEventListener("mousemove", handleMouseMove)

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  // Update current subtitle
  useEffect(() => {
    const sub = subtitles.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    )
    setCurrentSubtitle(sub?.text || "")
  }, [currentTime, subtitles])

  // Update current chapter
  useEffect(() => {
    const chapter = chapters.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    )
    if (chapter && chapter.id !== currentChapter?.id) {
      setCurrentChapter(chapter)
      onChapterChange?.(chapter.id)
    }
  }, [currentTime, chapters, currentChapter, onChapterChange])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
      onProgress?.((video.currentTime / video.duration) * 100)
    }
  }, [onTimeUpdate, onProgress])

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (video) {
      setDuration(video.duration)
    }
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (video) {
      video.volume = value[0]
      setVolume(value[0])
      setIsMuted(value[0] === 0)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      await container.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isPiP) {
        await video.requestPictureInPicture()
        setIsPiP(true)
      } else {
        await document.exitPictureInPicture()
        setIsPiP(false)
      }
    } catch (error) {
      console.error("PiP error:", error)
    }
  }

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSettings(false)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
    }
  }

  const goToChapter = (chapter: Chapter) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = chapter.startTime
      setShowChapters(false)
    }
  }

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative bg-black group"
          onDoubleClick={toggleFullscreen}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Subtitles Overlay */}
          {showSubtitles && currentSubtitle && (
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <span className="bg-black/80 text-white px-4 py-2 rounded-lg text-lg">
                {currentSubtitle}
              </span>
            </div>
          )}

          {/* Chapter indicator */}
          {currentChapter && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {currentChapter.title}
            </div>
          )}

          {/* Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress bar with chapters */}
            <div className="px-4 py-2">
              <div className="relative">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
                {/* Chapter markers */}
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="absolute top-0 w-1 h-3 bg-yellow-400 cursor-pointer"
                    style={{
                      left: `${(chapter.startTime / duration) * 100}%`,
                    }}
                    title={chapter.title}
                    onClick={() => goToChapter(chapter)}
                  />
                ))}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => skip(-10)}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => skip(10)}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    className="w-20"
                  />
                </div>

                <span className="text-white text-sm ml-4">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Chapters */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowChapters(!showChapters)}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  {showChapters && chapters.length > 0 && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[200px]">
                      {chapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-white/20 ${
                            currentChapter?.id === chapter.id
                              ? "text-primary"
                              : "text-white"
                          }`}
                          onClick={() => goToChapter(chapter)}
                        >
                          <span className="text-muted-foreground mr-2">
                            {formatTime(chapter.startTime)}
                          </span>
                          {chapter.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitles toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-white/20 ${
                    showSubtitles ? "text-primary" : "text-white"
                  }`}
                  onClick={() => setShowSubtitles(!showSubtitles)}
                >
                  <Subtitles className="h-5 w-5" />
                </Button>

                {/* Settings (playback speed) */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground px-2 mb-2">
                        Playback Speed
                      </p>
                      {playbackSpeeds.map((speed) => (
                        <button
                          key={speed}
                          className={`w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20 ${
                            playbackSpeed === speed ? "text-primary" : "text-white"
                          }`}
                          onClick={() => handleSpeedChange(speed)}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture-in-Picture */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-white/20 ${
                    isPiP ? "text-primary" : "text-white"
                  }`}
                  onClick={togglePiP}
                >
                  <PictureInPicture className="h-5 w-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Auto-generate chapters from script
export async function generateChaptersFromScript(
  script: string,
  totalDuration: number
): Promise<Chapter[]> {
  const sections = script.split(/\n\n+/)
  const chapterDuration = totalDuration / sections.length

  return sections.map((section, index) => ({
    id: `chapter-${index + 1}`,
    title: section.split("\n")[0].slice(0, 50) || `Chapter ${index + 1}`,
    startTime: index * chapterDuration,
    endTime: (index + 1) * chapterDuration,
  }))
}
