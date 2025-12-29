"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LearningDashboard,
  generateSampleDashboardData,
} from "@/components/analytics/LearningDashboard"
import {
  downloadReport,
  generatePDFReport,
  generateExcelReport,
  generateJSONReport,
  generateSampleReportData,
} from "@/lib/reports/exportReport"
import { FileDown, FileSpreadsheet, FileJson } from "lucide-react"

export default function DashboardPage() {
  const [isExporting, setIsExporting] = useState(false)
  const dashboardData = generateSampleDashboardData()

  const handleExport = async (format: "pdf" | "excel" | "json") => {
    setIsExporting(true)
    try {
      const reportData = generateSampleReportData("Student Name")

      let blob: Blob
      let filename: string

      switch (format) {
        case "pdf":
          blob = await generatePDFReport(reportData)
          filename = "learning-report.html" // HTML for now, would be PDF with proper library
          break
        case "excel":
          blob = await generateExcelReport(reportData)
          filename = "learning-report.csv"
          break
        case "json":
          blob = generateJSONReport(reportData)
          filename = "learning-report.json"
          break
      }

      downloadReport(blob, filename)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Learning Dashboard</h1>
              <p className="text-muted-foreground">
                Track your progress and performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("excel")}
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("json")}
                disabled={isExporting}
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          <LearningDashboard
            stats={dashboardData.stats}
            dailyActivity={dashboardData.dailyActivity}
            topicPerformance={dashboardData.topicPerformance}
            weeklyGoals={dashboardData.weeklyGoals}
            recentAchievements={dashboardData.recentAchievements}
          />
        </div>
      </main>
    </div>
  )
}
