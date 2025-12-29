"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react"

export interface LearningStats {
  totalProblems: number
  correctAnswers: number
  totalTime: number // minutes
  streak: number
  longestStreak: number
  level: number
  xp: number
  xpToNextLevel: number
}

export interface DailyActivity {
  date: string
  problemsSolved: number
  timeSpent: number
  accuracy: number
}

export interface TopicPerformance {
  topic: string
  accuracy: number
  problemsSolved: number
  averageTime: number
}

export interface WeeklyGoal {
  name: string
  current: number
  target: number
  unit: string
}

interface LearningDashboardProps {
  stats: LearningStats
  dailyActivity: DailyActivity[]
  topicPerformance: TopicPerformance[]
  weeklyGoals: WeeklyGoal[]
  recentAchievements?: { name: string; icon: string; date: Date }[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function LearningDashboard({
  stats,
  dailyActivity,
  topicPerformance,
  weeklyGoals,
  recentAchievements = [],
}: LearningDashboardProps) {
  const accuracy = stats.totalProblems > 0
    ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
    : 0

  const levelProgress = (stats.xp / stats.xpToNextLevel) * 100

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">{stats.totalProblems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Studied</p>
                <p className="text-2xl font-bold">
                  {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Level {stats.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.xp} / {stats.xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="problemsSolved"
                  name="Problems Solved"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="timeSpent"
                  name="Time (min)"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accuracy Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Accuracy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Performance by Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="topic" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGoals.map((goal, index) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100)
              const isComplete = goal.current >= goal.target

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isComplete ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Topic Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Problems by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicPerformance as unknown as Record<string, unknown>[]}
                  dataKey="problemsSolved"
                  nameKey="topic"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {topicPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Keep learning to earn achievements!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Sample data generator
export function generateSampleDashboardData() {
  const stats: LearningStats = {
    totalProblems: 347,
    correctAnswers: 289,
    totalTime: 1250,
    streak: 12,
    longestStreak: 23,
    level: 7,
    xp: 3450,
    xpToNextLevel: 5000,
  }

  const dailyActivity: DailyActivity[] = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    problemsSolved: Math.floor(Math.random() * 20) + 5,
    timeSpent: Math.floor(Math.random() * 60) + 15,
    accuracy: Math.floor(Math.random() * 30) + 70,
  }))

  const topicPerformance: TopicPerformance[] = [
    { topic: "Algebra", accuracy: 92, problemsSolved: 87, averageTime: 120 },
    { topic: "Calculus", accuracy: 78, problemsSolved: 65, averageTime: 180 },
    { topic: "Geometry", accuracy: 85, problemsSolved: 54, averageTime: 150 },
    { topic: "Trigonometry", accuracy: 71, problemsSolved: 43, averageTime: 200 },
    { topic: "Statistics", accuracy: 88, problemsSolved: 38, averageTime: 140 },
  ]

  const weeklyGoals: WeeklyGoal[] = [
    { name: "Problems Solved", current: 45, target: 50, unit: "problems" },
    { name: "Study Time", current: 280, target: 300, unit: "min" },
    { name: "Perfect Score Sessions", current: 3, target: 5, unit: "sessions" },
    { name: "New Topics", current: 2, target: 2, unit: "topics" },
  ]

  const recentAchievements = [
    { name: "First 100 Problems", icon: "🎯", date: new Date(Date.now() - 86400000) },
    { name: "Week Streak", icon: "🔥", date: new Date(Date.now() - 172800000) },
    { name: "Perfect Score", icon: "⭐", date: new Date(Date.now() - 259200000) },
  ]

  return { stats, dailyActivity, topicPerformance, weeklyGoals, recentAchievements }
}
