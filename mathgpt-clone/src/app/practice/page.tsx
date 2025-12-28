"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { SubjectNav } from "@/components/layout/SubjectNav"
import { FileText, Clock, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const practiceTests = [
  {
    id: 1,
    title: "Algebra Fundamentals",
    questions: 20,
    duration: "30 min",
    difficulty: "Beginner",
  },
  {
    id: 2,
    title: "Calculus Basics",
    questions: 15,
    duration: "25 min",
    difficulty: "Intermediate",
  },
  {
    id: 3,
    title: "Linear Algebra",
    questions: 25,
    duration: "40 min",
    difficulty: "Advanced",
  },
]

export default function PracticePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <SubjectNav />
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Practice Tests</h1>
              <p className="text-muted-foreground mt-2">
                Test your knowledge with AI-generated practice problems
              </p>
            </div>

            <div className="grid gap-4">
              {practiceTests.map((test) => (
                <div
                  key={test.id}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{test.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {test.questions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {test.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {test.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2">
                      Start Test
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-8 border-t border-border">
              <p className="text-muted-foreground">
                More practice tests coming soon...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
