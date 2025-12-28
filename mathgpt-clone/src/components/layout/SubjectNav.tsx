"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SUBJECTS, type Subject } from "@/types"

export function SubjectNav() {
  const [selectedSubject, setSelectedSubject] = React.useState<Subject>("math")

  React.useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("selectedSubject") as Subject | null
    if (saved && SUBJECTS.find((s) => s.id === saved)) {
      setSelectedSubject(saved)
    }
  }, [])

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject)
    localStorage.setItem("selectedSubject", subject)
    // Update document title
    const subjectConfig = SUBJECTS.find((s) => s.id === subject)
    if (subjectConfig) {
      document.title = `${subjectConfig.name} - AI Tutor`
    }
  }

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-center gap-1 p-2">
        {SUBJECTS.map((subject) => {
          const isSelected = selectedSubject === subject.id
          return (
            <button
              key={subject.id}
              onClick={() => handleSubjectChange(subject.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isSelected
                  ? "text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              style={
                isSelected
                  ? { backgroundColor: subject.color }
                  : undefined
              }
            >
              {subject.name}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
