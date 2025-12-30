"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Flame, Star, TrendingUp, Clock } from "lucide-react"

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  points: number
  streak: number
  problemsSolved: number
  accuracy: number
  level: number
  badges: string[]
  change?: number // Position change since last period
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  period?: "daily" | "weekly" | "monthly" | "allTime"
  onPeriodChange?: (period: string) => void
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Trophy className="h-6 w-6 text-yellow-500" />,
  2: <Medal className="h-6 w-6 text-gray-400" />,
  3: <Medal className="h-6 w-6 text-amber-600" />,
}

const levelBadges: Record<number, { name: string; color: string }> = {
  1: { name: "Beginner", color: "bg-gray-500" },
  2: { name: "Learner", color: "bg-green-500" },
  3: { name: "Student", color: "bg-blue-500" },
  4: { name: "Scholar", color: "bg-purple-500" },
  5: { name: "Expert", color: "bg-orange-500" },
  6: { name: "Master", color: "bg-red-500" },
  7: { name: "Grandmaster", color: "bg-yellow-500" },
}

export function Leaderboard({
  entries,
  currentUserId,
  period = "weekly",
  onPeriodChange,
}: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod as typeof period)
    onPeriodChange?.(newPeriod)
  }

  const currentUserEntry = entries.find((e) => e.userId === currentUserId)
  const topThree = entries.slice(0, 3)
  const restOfList = entries.slice(3)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs">
                Today
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                Week
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">
                Month
              </TabsTrigger>
              <TabsTrigger value="allTime" className="text-xs">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 py-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-gray-400">
                <AvatarImage src={topThree[1].avatar} />
                <AvatarFallback>{topThree[1].name[0]}</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="font-semibold text-sm">{topThree[1].name}</p>
                <p className="text-xs text-muted-foreground">
                  {topThree[1].points.toLocaleString()} pts
                </p>
              </div>
              <div className="mt-2 bg-gray-400 text-white w-16 h-20 flex items-center justify-center rounded-t-lg font-bold text-2xl">
                2
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-yellow-500">
                  <AvatarImage src={topThree[0].avatar} />
                  <AvatarFallback>{topThree[0].name[0]}</AvatarFallback>
                </Avatar>
                <Trophy className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2 text-center">
                <p className="font-semibold">{topThree[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {topThree[0].points.toLocaleString()} pts
                </p>
              </div>
              <div className="mt-2 bg-yellow-500 text-white w-20 h-24 flex items-center justify-center rounded-t-lg font-bold text-3xl">
                1
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <Avatar className="h-14 w-14 border-4 border-amber-600">
                <AvatarImage src={topThree[2].avatar} />
                <AvatarFallback>{topThree[2].name[0]}</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="font-semibold text-sm">{topThree[2].name}</p>
                <p className="text-xs text-muted-foreground">
                  {topThree[2].points.toLocaleString()} pts
                </p>
              </div>
              <div className="mt-2 bg-amber-600 text-white w-14 h-16 flex items-center justify-center rounded-t-lg font-bold text-xl">
                3
              </div>
            </div>
          )}
        </div>

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {restOfList.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                entry.userId === currentUserId
                  ? "bg-primary/10 border border-primary"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <span className="w-8 text-center font-bold text-muted-foreground">
                {entry.rank}
              </span>

              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>{entry.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{entry.name}</p>
                  <Badge
                    className={`${levelBadges[entry.level]?.color || "bg-gray-500"} text-white text-xs`}
                  >
                    {levelBadges[entry.level]?.name || `Lv.${entry.level}`}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {entry.streak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {entry.accuracy}% accuracy
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold">{entry.points.toLocaleString()}</p>
                {entry.change !== undefined && entry.change !== 0 && (
                  <p
                    className={`text-xs flex items-center justify-end gap-1 ${
                      entry.change > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <TrendingUp
                      className={`h-3 w-3 ${entry.change < 0 ? "rotate-180" : ""}`}
                    />
                    {Math.abs(entry.change)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current user if not in visible list */}
        {currentUserEntry && currentUserEntry.rank > 10 && (
          <>
            <div className="text-center text-muted-foreground text-sm">• • •</div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary">
              <span className="w-8 text-center font-bold">
                {currentUserEntry.rank}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUserEntry.avatar} />
                <AvatarFallback>{currentUserEntry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{currentUserEntry.name} (You)</p>
              </div>
              <p className="font-bold">{currentUserEntry.points.toLocaleString()}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Sample data generator
export function generateSampleLeaderboard(): LeaderboardEntry[] {
  const names = [
    "Alex Chen",
    "Sarah Johnson",
    "Michael Wang",
    "Emma Davis",
    "James Wilson",
    "Olivia Brown",
    "William Lee",
    "Sophia Garcia",
    "Benjamin Martinez",
    "Isabella Anderson",
  ]

  return names.map((name, index) => ({
    rank: index + 1,
    userId: `user-${index + 1}`,
    name,
    points: Math.floor(10000 - index * 800 + Math.random() * 200),
    streak: Math.floor(Math.random() * 30) + 1,
    problemsSolved: Math.floor(Math.random() * 500) + 50,
    accuracy: Math.floor(Math.random() * 30) + 70,
    level: Math.max(1, 7 - Math.floor(index / 2)),
    badges: ["fast-solver", "perfect-week", "helper"],
    change: Math.floor(Math.random() * 5) - 2,
  }))
}
