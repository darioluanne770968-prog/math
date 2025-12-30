"use client"

export interface LearningNode {
  id: string
  topic: string
  subtopic: string
  mastery: number // 0-100
  prerequisites: string[]
  nextTopics: string[]
  estimatedTime: number // minutes
  completed: boolean
}

export interface LearningPath {
  userId: string
  currentNode: string
  nodes: LearningNode[]
  totalProgress: number
  estimatedCompletion: Date
  streak: number
  lastActivity: Date
}

export interface PerformanceData {
  topicId: string
  correctAnswers: number
  totalAttempts: number
  averageTime: number
  lastAttempt: Date
}

export function calculateMastery(performance: PerformanceData): number {
  if (performance.totalAttempts === 0) return 0

  const accuracy = performance.correctAnswers / performance.totalAttempts
  const recency = getRecencyFactor(performance.lastAttempt)
  const consistency = Math.min(performance.totalAttempts / 10, 1) // Max out at 10 attempts

  return Math.round(accuracy * 60 + recency * 20 + consistency * 20)
}

function getRecencyFactor(lastAttempt: Date): number {
  const daysSince = (Date.now() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince < 1) return 1
  if (daysSince < 7) return 0.8
  if (daysSince < 30) return 0.5
  return 0.2
}

export function getNextRecommendedTopic(path: LearningPath): LearningNode | null {
  // Find incomplete nodes with completed prerequisites
  const availableNodes = path.nodes.filter((node) => {
    if (node.completed) return false
    return node.prerequisites.every((prereqId) => {
      const prereq = path.nodes.find((n) => n.id === prereqId)
      return prereq?.completed || (prereq?.mastery ?? 0) >= 70
    })
  })

  if (availableNodes.length === 0) return null

  // Sort by mastery (prefer lower mastery) and estimated time
  availableNodes.sort((a, b) => {
    const masteryDiff = a.mastery - b.mastery
    if (Math.abs(masteryDiff) > 20) return masteryDiff
    return a.estimatedTime - b.estimatedTime
  })

  return availableNodes[0]
}

export function generateLearningPath(
  subject: string,
  userLevel: number
): LearningNode[] {
  // Define learning paths for different subjects
  const paths: Record<string, LearningNode[]> = {
    algebra: [
      {
        id: "alg-1",
        topic: "Algebra",
        subtopic: "Variables and Expressions",
        mastery: 0,
        prerequisites: [],
        nextTopics: ["alg-2"],
        estimatedTime: 30,
        completed: false,
      },
      {
        id: "alg-2",
        topic: "Algebra",
        subtopic: "Linear Equations",
        mastery: 0,
        prerequisites: ["alg-1"],
        nextTopics: ["alg-3", "alg-4"],
        estimatedTime: 45,
        completed: false,
      },
      {
        id: "alg-3",
        topic: "Algebra",
        subtopic: "Systems of Equations",
        mastery: 0,
        prerequisites: ["alg-2"],
        nextTopics: ["alg-5"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "alg-4",
        topic: "Algebra",
        subtopic: "Inequalities",
        mastery: 0,
        prerequisites: ["alg-2"],
        nextTopics: ["alg-5"],
        estimatedTime: 45,
        completed: false,
      },
      {
        id: "alg-5",
        topic: "Algebra",
        subtopic: "Quadratic Equations",
        mastery: 0,
        prerequisites: ["alg-3", "alg-4"],
        nextTopics: ["alg-6"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "alg-6",
        topic: "Algebra",
        subtopic: "Polynomials",
        mastery: 0,
        prerequisites: ["alg-5"],
        nextTopics: ["alg-7"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "alg-7",
        topic: "Algebra",
        subtopic: "Factoring",
        mastery: 0,
        prerequisites: ["alg-6"],
        nextTopics: ["alg-8"],
        estimatedTime: 45,
        completed: false,
      },
      {
        id: "alg-8",
        topic: "Algebra",
        subtopic: "Rational Expressions",
        mastery: 0,
        prerequisites: ["alg-7"],
        nextTopics: [],
        estimatedTime: 60,
        completed: false,
      },
    ],
    calculus: [
      {
        id: "calc-1",
        topic: "Calculus",
        subtopic: "Limits",
        mastery: 0,
        prerequisites: [],
        nextTopics: ["calc-2"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "calc-2",
        topic: "Calculus",
        subtopic: "Derivatives",
        mastery: 0,
        prerequisites: ["calc-1"],
        nextTopics: ["calc-3", "calc-4"],
        estimatedTime: 90,
        completed: false,
      },
      {
        id: "calc-3",
        topic: "Calculus",
        subtopic: "Chain Rule",
        mastery: 0,
        prerequisites: ["calc-2"],
        nextTopics: ["calc-5"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "calc-4",
        topic: "Calculus",
        subtopic: "Product & Quotient Rules",
        mastery: 0,
        prerequisites: ["calc-2"],
        nextTopics: ["calc-5"],
        estimatedTime: 60,
        completed: false,
      },
      {
        id: "calc-5",
        topic: "Calculus",
        subtopic: "Applications of Derivatives",
        mastery: 0,
        prerequisites: ["calc-3", "calc-4"],
        nextTopics: ["calc-6"],
        estimatedTime: 90,
        completed: false,
      },
      {
        id: "calc-6",
        topic: "Calculus",
        subtopic: "Integrals",
        mastery: 0,
        prerequisites: ["calc-5"],
        nextTopics: ["calc-7"],
        estimatedTime: 90,
        completed: false,
      },
      {
        id: "calc-7",
        topic: "Calculus",
        subtopic: "Integration Techniques",
        mastery: 0,
        prerequisites: ["calc-6"],
        nextTopics: ["calc-8"],
        estimatedTime: 120,
        completed: false,
      },
      {
        id: "calc-8",
        topic: "Calculus",
        subtopic: "Differential Equations",
        mastery: 0,
        prerequisites: ["calc-7"],
        nextTopics: [],
        estimatedTime: 120,
        completed: false,
      },
    ],
  }

  // Adjust starting point based on user level
  const selectedPath = paths[subject.toLowerCase()] || paths.algebra
  const skipCount = Math.floor((userLevel / 10) * selectedPath.length * 0.5)

  return selectedPath.map((node, index) => ({
    ...node,
    completed: index < skipCount,
    mastery: index < skipCount ? 80 + Math.random() * 20 : 0,
  }))
}

export function updatePathProgress(
  path: LearningPath,
  nodeId: string,
  performance: PerformanceData
): LearningPath {
  const updatedNodes = path.nodes.map((node) => {
    if (node.id === nodeId) {
      const mastery = calculateMastery(performance)
      return {
        ...node,
        mastery,
        completed: mastery >= 70,
      }
    }
    return node
  })

  const completedCount = updatedNodes.filter((n) => n.completed).length
  const totalProgress = Math.round((completedCount / updatedNodes.length) * 100)

  return {
    ...path,
    nodes: updatedNodes,
    totalProgress,
    lastActivity: new Date(),
  }
}
