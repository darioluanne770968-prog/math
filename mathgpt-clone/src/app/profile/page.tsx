"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { SubjectNav } from "@/components/layout/SubjectNav"
import { useAuth } from "@/components/layout/AuthProvider"
import { VideoGallery } from "@/components/video/VideoGallery"
import { Button } from "@/components/ui/button"
import {
  User,
  Video,
  Heart,
  FileText,
  BarChart3,
  Settings,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "videos" | "favorites" | "notes" | "progress"

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = React.useState<Tab>("videos")

  const tabs = [
    { id: "videos" as Tab, label: "My Videos", icon: Video },
    { id: "favorites" as Tab, label: "Favorites", icon: Heart },
    { id: "notes" as Tab, label: "Notes", icon: FileText },
    { id: "progress" as Tab, label: "Progress", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <SubjectNav />
        <div className="p-4 md:p-8">
          {/* Profile Header */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {user?.user_metadata?.name || user?.email || "User"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>

                <div className="flex gap-6 mt-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">48</div>
                    <div className="text-sm text-muted-foreground">Hours Learned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">7</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Settings Button */}
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === "videos" && (
                <VideoGallery
                  onVideoClick={(video) => {
                    console.log("Video clicked:", video)
                  }}
                />
              )}

              {activeTab === "favorites" && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Videos you favorite will appear here
                  </p>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Notes you take while watching videos will appear here
                  </p>
                </div>
              )}

              {activeTab === "progress" && (
                <div className="space-y-6">
                  {/* Progress Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl border border-border bg-card">
                      <div className="text-3xl font-bold text-primary">85%</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Completion Rate
                      </div>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card">
                      <div className="text-3xl font-bold text-primary">24</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Videos Completed
                      </div>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card">
                      <div className="text-3xl font-bold text-primary">4.8</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Average Score
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="w-16 h-12 rounded bg-primary/10 flex items-center justify-center">
                            <Video className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              Quadratic Equations
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Completed {i} day{i > 1 ? "s" : ""} ago
                            </div>
                          </div>
                          <div className="text-primary font-medium">100%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
