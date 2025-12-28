"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { SubjectNav } from "@/components/layout/SubjectNav"
import { VideoGallery } from "@/components/video/VideoGallery"

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <SubjectNav />
        <div className="p-4 md:p-8">
          <VideoGallery
            onVideoClick={(video) => {
              console.log("Video clicked:", video)
              // TODO: Navigate to video player page
            }}
          />
        </div>
      </main>
    </div>
  )
}
