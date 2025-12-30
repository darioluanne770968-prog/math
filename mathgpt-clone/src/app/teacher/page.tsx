"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  Mail,
  BarChart3,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  lastActive: Date
  stats: {
    totalProblems: number
    accuracy: number
    streak: number
    level: number
    weeklyProgress: number // compared to last week
  }
  alerts: string[]
}

interface ClassStats {
  totalStudents: number
  activeToday: number
  averageAccuracy: number
  averageProblems: number
  topPerformers: { name: string; score: number }[]
  needsAttention: { name: string; issue: string }[]
}

// Sample data
const sampleStudents: Student[] = [
  {
    id: "1",
    name: "Alex Chen",
    email: "alex@example.com",
    lastActive: new Date(),
    stats: { totalProblems: 234, accuracy: 92, streak: 15, level: 8, weeklyProgress: 12 },
    alerts: [],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    lastActive: new Date(Date.now() - 86400000),
    stats: { totalProblems: 189, accuracy: 85, streak: 7, level: 6, weeklyProgress: -5 },
    alerts: ["Accuracy dropped 5% this week"],
  },
  {
    id: "3",
    name: "Michael Wang",
    email: "michael@example.com",
    lastActive: new Date(Date.now() - 3 * 86400000),
    stats: { totalProblems: 156, accuracy: 78, streak: 0, level: 5, weeklyProgress: -15 },
    alerts: ["Inactive for 3 days", "Struggling with Calculus"],
  },
  {
    id: "4",
    name: "Emma Davis",
    email: "emma@example.com",
    lastActive: new Date(),
    stats: { totalProblems: 312, accuracy: 95, streak: 21, level: 9, weeklyProgress: 8 },
    alerts: [],
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james@example.com",
    lastActive: new Date(Date.now() - 7 * 86400000),
    stats: { totalProblems: 87, accuracy: 65, streak: 0, level: 3, weeklyProgress: -25 },
    alerts: ["Inactive for 7 days", "Below average accuracy", "Needs support"],
  },
]

const classProgressData = [
  { week: "Week 1", avgProblems: 45, avgAccuracy: 72 },
  { week: "Week 2", avgProblems: 52, avgAccuracy: 75 },
  { week: "Week 3", avgProblems: 48, avgAccuracy: 78 },
  { week: "Week 4", avgProblems: 61, avgAccuracy: 80 },
]

const topicDistribution = [
  { topic: "Algebra", students: 45 },
  { topic: "Calculus", students: 32 },
  { topic: "Geometry", students: 28 },
  { topic: "Trigonometry", students: 22 },
  { topic: "Statistics", students: 18 },
]

export default function TeacherDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const classStats: ClassStats = {
    totalStudents: sampleStudents.length,
    activeToday: sampleStudents.filter(
      (s) => new Date().getTime() - s.lastActive.getTime() < 86400000
    ).length,
    averageAccuracy: Math.round(
      sampleStudents.reduce((acc, s) => acc + s.stats.accuracy, 0) / sampleStudents.length
    ),
    averageProblems: Math.round(
      sampleStudents.reduce((acc, s) => acc + s.stats.totalProblems, 0) / sampleStudents.length
    ),
    topPerformers: sampleStudents
      .sort((a, b) => b.stats.accuracy - a.stats.accuracy)
      .slice(0, 3)
      .map((s) => ({ name: s.name, score: s.stats.accuracy })),
    needsAttention: sampleStudents
      .filter((s) => s.alerts.length > 0)
      .map((s) => ({ name: s.name, issue: s.alerts[0] })),
  }

  const filteredStudents = sampleStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Monitor student progress and performance</p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{classStats.totalStudents}</p>
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
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold">{classStats.activeToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                    <p className="text-2xl font-bold">{classStats.averageAccuracy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <AlertCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Need Attention</p>
                    <p className="text-2xl font-bold">{classStats.needsAttention.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="students">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="analytics">Class Analytics</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Student List */}
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{student.name}</p>
                            {student.alerts.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {student.alerts.length} alerts
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last active:{" "}
                            {student.lastActive.toLocaleDateString() ===
                            new Date().toLocaleDateString()
                              ? "Today"
                              : student.lastActive.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold">{student.stats.totalProblems}</p>
                            <p className="text-xs text-muted-foreground">Problems</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">{student.stats.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">{student.stats.streak}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>
                          <div className="text-center">
                            <p
                              className={`font-bold flex items-center gap-1 ${
                                student.stats.weeklyProgress >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {student.stats.weeklyProgress >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(student.stats.weeklyProgress)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Weekly</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Progress Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={classProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avgProblems"
                          name="Avg Problems"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="avgAccuracy"
                          name="Avg Accuracy %"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Topic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topicDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="topic" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" name="Students" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {classStats.topPerformers.map((student, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="font-bold text-lg text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <span className="flex-1">{student.name}</span>
                          <Badge variant="secondary">{student.score}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Students Needing Attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {classStats.needsAttention.map((student, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-red-500/10 rounded-lg"
                        >
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.issue}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Contact
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {sampleStudents
                .filter((s) => s.alerts.length > 0)
                .flatMap((student) =>
                  student.alerts.map((alert, index) => ({
                    student,
                    alert,
                    key: `${student.id}-${index}`,
                  }))
                )
                .map(({ student, alert, key }) => (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/10 rounded-full">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{alert}</p>
                          <p className="text-sm text-muted-foreground">
                            Student: {student.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button size="sm">Take Action</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
