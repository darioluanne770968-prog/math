"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Check,
  Search,
  Filter,
  Plus,
  Clock,
  Eye,
  Award,
} from "lucide-react"
import katex from "katex"

export interface Answer {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    reputation: number
  }
  upvotes: number
  downvotes: number
  isAccepted: boolean
  createdAt: Date
  userVote?: "up" | "down" | null
}

export interface Question {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    reputation: number
  }
  tags: string[]
  upvotes: number
  downvotes: number
  views: number
  answers: Answer[]
  hasAcceptedAnswer: boolean
  createdAt: Date
  userVote?: "up" | "down" | null
}

interface QAForumProps {
  questions: Question[]
  currentUserId: string
  onAskQuestion?: (data: { title: string; content: string; tags: string[] }) => void
  onAnswer?: (questionId: string, content: string) => void
  onVote?: (type: "question" | "answer", id: string, vote: "up" | "down") => void
  onAcceptAnswer?: (questionId: string, answerId: string) => void
}

export function QAForum({
  questions,
  currentUserId,
  onAskQuestion,
  onAnswer,
  onVote,
  onAcceptAnswer,
}: QAForumProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAskModal, setShowAskModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = Array.from(new Set(questions.flatMap((q) => q.tags)))

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => q.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  const renderContent = (content: string) => {
    const parts = content.split(/(\$[^$]+\$|\$\$[^$]+\$\$)/g)
    return parts.map((part, i) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const latex = part.slice(2, -2)
        return (
          <div
            key={i}
            className="my-2"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(latex, { displayMode: true, throwOnError: false }),
            }}
          />
        )
      } else if (part.startsWith("$") && part.endsWith("$")) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Q&A Community
        </h2>
        <Button onClick={() => setShowAskModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {allTags.slice(0, 6).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onSelect={() => setSelectedQuestion(question)}
            onVote={(vote) => onVote?.("question", question.id, vote)}
            renderContent={renderContent}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions found</p>
            <Button variant="link" onClick={() => setShowAskModal(true)}>
              Be the first to ask!
            </Button>
          </div>
        )}
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          currentUserId={currentUserId}
          onClose={() => setSelectedQuestion(null)}
          onAnswer={(content) => onAnswer?.(selectedQuestion.id, content)}
          onVote={(type, id, vote) => onVote?.(type, id, vote)}
          onAcceptAnswer={(answerId) => onAcceptAnswer?.(selectedQuestion.id, answerId)}
          renderContent={renderContent}
        />
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <AskQuestionModal
          onClose={() => setShowAskModal(false)}
          onSubmit={(data) => {
            onAskQuestion?.(data)
            setShowAskModal(false)
          }}
          existingTags={allTags}
        />
      )}
    </div>
  )
}

function QuestionCard({
  question,
  onSelect,
  onVote,
  renderContent,
}: {
  question: Question
  onSelect: () => void
  onVote: (vote: "up" | "down") => void
  renderContent: (content: string) => React.ReactNode
}) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div
            className="flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className={question.userVote === "up" ? "text-primary" : ""}
              onClick={() => onVote("up")}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-bold">{question.upvotes - question.downvotes}</span>
            <Button
              variant="ghost"
              size="icon"
              className={question.userVote === "down" ? "text-destructive" : ""}
              onClick={() => onVote("down")}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 hover:text-primary">
              {question.title}
            </h3>
            <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {renderContent(question.content)}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 ml-auto text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {question.answers.length}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views}
                </span>
                {question.hasAcceptedAnswer && (
                  <Badge className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Solved
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionDetailModal({
  question,
  currentUserId,
  onClose,
  onAnswer,
  onVote,
  onAcceptAnswer,
  renderContent,
}: {
  question: Question
  currentUserId: string
  onClose: () => void
  onAnswer: (content: string) => void
  onVote: (type: "question" | "answer", id: string, vote: "up" | "down") => void
  onAcceptAnswer: (answerId: string) => void
  renderContent: (content: string) => React.ReactNode
}) {
  const [answerContent, setAnswerContent] = useState("")
  const isAuthor = question.author.id === currentUserId

  const handleSubmitAnswer = () => {
    if (answerContent.trim()) {
      onAnswer(answerContent)
      setAnswerContent("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{question.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={question.author.avatar} />
                    <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{question.author.name}</span>
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {question.author.reputation}
                  </Badge>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(question.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question content */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={question.userVote === "up" ? "text-primary" : ""}
                onClick={() => onVote("question", question.id, "up")}
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <span className="font-bold text-lg">
                {question.upvotes - question.downvotes}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={question.userVote === "down" ? "text-destructive" : ""}
                onClick={() => onVote("question", question.id, "down")}
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 prose dark:prose-invert max-w-none">
              {renderContent(question.content)}
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Answers */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">
              {question.answers.length} Answers
            </h3>
            <div className="space-y-6">
              {question.answers
                .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0))
                .map((answer) => (
                  <div
                    key={answer.id}
                    className={`flex gap-4 p-4 rounded-lg ${
                      answer.isAccepted ? "bg-green-500/10 border border-green-500" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={answer.userVote === "up" ? "text-primary" : ""}
                        onClick={() => onVote("answer", answer.id, "up")}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold">
                        {answer.upvotes - answer.downvotes}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={answer.userVote === "down" ? "text-destructive" : ""}
                        onClick={() => onVote("answer", answer.id, "down")}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      {isAuthor && !question.hasAcceptedAnswer && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-2"
                          onClick={() => onAcceptAnswer(answer.id)}
                          title="Accept this answer"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {answer.isAccepted && (
                        <Check className="h-6 w-6 text-green-500 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="prose dark:prose-invert max-w-none mb-4">
                        {renderContent(answer.content)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={answer.author.avatar} />
                          <AvatarFallback>{answer.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{answer.author.name}</span>
                        <span>•</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Add Answer */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Your Answer</h3>
            <Textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Write your answer... Use $...$ for inline math and $$...$$ for display math."
              rows={6}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={handleSubmitAnswer}>Post Answer</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AskQuestionModal({
  onClose,
  onSubmit,
  existingTags,
}: {
  onClose: () => void
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void
  existingTags: string[]
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      onSubmit({ title, content, tags })
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question?"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Details</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your question in detail. Use $...$ for inline math and $$...$$ for display math."
                rows={8}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {existingTags
                  .filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => setTags([...tags, tag])}
                    >
                      + {tag}
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Post Question</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Sample data generator
export function generateSampleQuestions(): Question[] {
  return [
    {
      id: "q1",
      title: "How do I solve this integral: $\\int x^2 e^x dx$?",
      content:
        "I'm trying to solve this integral using integration by parts but I keep getting stuck. The integral is:\n\n$$\\int x^2 e^x dx$$\n\nI tried letting $u = x^2$ and $dv = e^x dx$, but I end up with another integral that's just as hard. What am I missing?",
      author: { id: "user-1", name: "Alex Chen", reputation: 150 },
      tags: ["calculus", "integration", "integration-by-parts"],
      upvotes: 12,
      downvotes: 1,
      views: 234,
      hasAcceptedAnswer: true,
      createdAt: new Date(Date.now() - 86400000),
      answers: [
        {
          id: "a1",
          content:
            "You're on the right track! The key is that you need to apply integration by parts twice.\n\nFirst application:\n- $u = x^2$, $dv = e^x dx$\n- $du = 2x dx$, $v = e^x$\n\n$$\\int x^2 e^x dx = x^2 e^x - 2\\int x e^x dx$$\n\nSecond application on $\\int x e^x dx$:\n- $u = x$, $dv = e^x dx$\n\n$$\\int x e^x dx = x e^x - e^x$$\n\nFinal answer:\n$$\\int x^2 e^x dx = x^2 e^x - 2(x e^x - e^x) + C = e^x(x^2 - 2x + 2) + C$$",
          author: { id: "user-2", name: "Prof. Smith", reputation: 5420 },
          upvotes: 25,
          downvotes: 0,
          isAccepted: true,
          createdAt: new Date(Date.now() - 82400000),
        },
      ],
    },
    {
      id: "q2",
      title: "Why does $0.999... = 1$?",
      content:
        "I've heard that $0.999...$ (repeating forever) is equal to 1, but I don't understand how that's possible. They look like different numbers to me. Can someone explain this?",
      author: { id: "user-3", name: "Curious Student", reputation: 45 },
      tags: ["number-theory", "limits", "real-analysis"],
      upvotes: 45,
      downvotes: 3,
      views: 1523,
      hasAcceptedAnswer: false,
      createdAt: new Date(Date.now() - 172800000),
      answers: [
        {
          id: "a2",
          content:
            "There are several ways to prove this:\n\n**Proof 1 (Algebraic):**\nLet $x = 0.999...$\nThen $10x = 9.999...$\nSubtracting: $10x - x = 9.999... - 0.999...$\n$9x = 9$\n$x = 1$\n\n**Proof 2 (Geometric Series):**\n$$0.999... = \\frac{9}{10} + \\frac{9}{100} + \\frac{9}{1000} + ... = \\sum_{n=1}^{\\infty} \\frac{9}{10^n} = \\frac{9/10}{1 - 1/10} = 1$$",
          author: { id: "user-4", name: "Math Enthusiast", reputation: 890 },
          upvotes: 18,
          downvotes: 1,
          isAccepted: false,
          createdAt: new Date(Date.now() - 170000000),
        },
      ],
    },
  ]
}
