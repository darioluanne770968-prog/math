"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Shuffle,
  Brain,
} from "lucide-react"
import katex from "katex"

interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  lastReview?: Date
  nextReview?: Date
  easeFactor: number // SM-2 algorithm
  interval: number // days
  repetitions: number
}

interface FlashcardsProps {
  cards: Flashcard[]
  onCardReview?: (cardId: string, quality: number) => void
}

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(
  card: Flashcard,
  quality: number // 0-5, where 0-2 is failure, 3-5 is success
): { interval: number; easeFactor: number; repetitions: number } {
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    // Failed - reset
    repetitions = 0
    interval = 1
  } else {
    // Success
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  return { interval, easeFactor, repetitions }
}

export function Flashcards({ cards: initialCards, onCardReview }: FlashcardsProps) {
  const [cards, setCards] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyMode, setStudyMode] = useState<"all" | "due">("all")
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 })

  const dueCards = cards.filter((card) => {
    if (!card.nextReview) return true
    return new Date(card.nextReview) <= new Date()
  })

  const activeCards = studyMode === "due" ? dueCards : cards
  const currentCard = activeCards[currentIndex]

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [studyMode])

  const renderLatex = (text: string) => {
    try {
      // Check if text contains LaTeX
      if (text.includes("$")) {
        const parts = text.split(/(\$[^$]+\$)/g)
        return parts
          .map((part, i) => {
            if (part.startsWith("$") && part.endsWith("$")) {
              const latex = part.slice(1, -1)
              return (
                <span
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(latex, { throwOnError: false }),
                  }}
                />
              )
            }
            return <span key={i}>{part}</span>
          })
      }
      return text
    } catch {
      return text
    }
  }

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleNext = () => {
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...activeCards].sort(() => Math.random() - 0.5)
    setCards(studyMode === "due" ? shuffled : shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleReview = (quality: number) => {
    if (!currentCard) return

    const { interval, easeFactor, repetitions } = calculateNextReview(
      currentCard,
      quality
    )

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    // Update card
    const updatedCards = cards.map((card) =>
      card.id === currentCard.id
        ? { ...card, easeFactor, interval, repetitions, nextReview, lastReview: new Date() }
        : card
    )
    setCards(updatedCards)

    // Update stats
    if (quality >= 3) {
      setStats((s) => ({ ...s, correct: s.correct + 1 }))
    } else {
      setStats((s) => ({ ...s, incorrect: s.incorrect + 1 }))
    }

    onCardReview?.(currentCard.id, quality)
    handleNext()
  }

  if (activeCards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {studyMode === "due" ? "All caught up!" : "No flashcards"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {studyMode === "due"
              ? "You've reviewed all due cards. Check back later!"
              : "Add some flashcards to start studying."}
          </p>
          {studyMode === "due" && (
            <Button onClick={() => setStudyMode("all")}>Review All Cards</Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={studyMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStudyMode("all")}
          >
            All ({cards.length})
          </Button>
          <Button
            variant={studyMode === "due" ? "default" : "outline"}
            size="sm"
            onClick={() => setStudyMode("due")}
          >
            Due ({dueCards.length})
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {activeCards.length}
          </span>
          <Button variant="outline" size="icon" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center">
        <Badge variant="outline" className="text-green-500 border-green-500">
          <Check className="h-3 w-3 mr-1" />
          {stats.correct}
        </Badge>
        <Badge variant="outline" className="text-red-500 border-red-500">
          <X className="h-3 w-3 mr-1" />
          {stats.incorrect}
        </Badge>
      </div>

      {/* Flashcard */}
      <div
        className="relative h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <Badge className="mb-4">{currentCard.category}</Badge>
              <div className="text-2xl text-center">
                {renderLatex(currentCard.front)}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Click to reveal answer
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-xl text-center mb-4">
                {renderLatex(currentCard.back)}
              </div>
              <Badge
                variant="outline"
                className={
                  currentCard.difficulty === "easy"
                    ? "text-green-500"
                    : currentCard.difficulty === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
                }
              >
                {currentCard.difficulty}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {isFlipped && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-red-500 border-red-500"
              onClick={() => handleReview(1)}
            >
              <X className="h-4 w-4 mr-1" />
              Again
            </Button>
            <Button
              variant="outline"
              className="text-yellow-500 border-yellow-500"
              onClick={() => handleReview(3)}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Hard
            </Button>
            <Button
              variant="outline"
              className="text-green-500 border-green-500"
              onClick={() => handleReview(4)}
            >
              <Check className="h-4 w-4 mr-1" />
              Good
            </Button>
            <Button
              variant="default"
              className="bg-green-600"
              onClick={() => handleReview(5)}
            >
              Easy
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === activeCards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// Sample flashcards data
export const sampleFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is the quadratic formula?",
    back: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
    category: "Algebra",
    difficulty: "medium",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "2",
    front: "What is the derivative of $\\sin(x)$?",
    back: "$\\cos(x)$",
    category: "Calculus",
    difficulty: "easy",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "3",
    front: "What is the Pythagorean theorem?",
    back: "$a^2 + b^2 = c^2$",
    category: "Geometry",
    difficulty: "easy",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "4",
    front: "What is $\\int e^x dx$?",
    back: "$e^x + C$",
    category: "Calculus",
    difficulty: "easy",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "5",
    front: "What is the sum of angles in a triangle?",
    back: "$180°$ or $\\pi$ radians",
    category: "Geometry",
    difficulty: "easy",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "6",
    front: "What is the chain rule?",
    back: "$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$",
    category: "Calculus",
    difficulty: "medium",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "7",
    front: "What is $\\sin^2(x) + \\cos^2(x)$?",
    back: "$1$ (Pythagorean identity)",
    category: "Trigonometry",
    difficulty: "easy",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: "8",
    front: "What is the formula for compound interest?",
    back: "$A = P(1 + \\frac{r}{n})^{nt}$",
    category: "Finance",
    difficulty: "medium",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
]
