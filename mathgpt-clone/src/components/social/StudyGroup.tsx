"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  Calendar,
  MessageCircle,
  Video,
  Settings,
  Crown,
  Lock,
  Globe,
} from "lucide-react"

export interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: "owner" | "admin" | "member"
  joinedAt: Date
  isOnline?: boolean
}

export interface StudyGroupData {
  id: string
  name: string
  description: string
  subject: string
  members: GroupMember[]
  maxMembers: number
  isPrivate: boolean
  createdAt: Date
  nextSession?: {
    title: string
    scheduledAt: Date
  }
  recentActivity: {
    type: "message" | "session" | "resource"
    user: string
    content: string
    timestamp: Date
  }[]
}

interface StudyGroupProps {
  groups: StudyGroupData[]
  currentUserId: string
  onJoinGroup?: (groupId: string) => void
  onLeaveGroup?: (groupId: string) => void
  onCreateGroup?: (data: Partial<StudyGroupData>) => void
}

export function StudyGroup({
  groups,
  currentUserId,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
}: StudyGroupProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupData | null>(null)

  const myGroups = groups.filter((g) =>
    g.members.some((m) => m.id === currentUserId)
  )
  const discoverGroups = groups.filter(
    (g) => !g.members.some((m) => m.id === currentUserId)
  )

  const filteredDiscoverGroups = discoverGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Study Groups
        </h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Tabs defaultValue="my-groups">
        <TabsList>
          <TabsTrigger value="my-groups">
            My Groups ({myGroups.length})
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join a study group or create your own!
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  currentUserId={currentUserId}
                  onSelect={() => setSelectedGroup(group)}
                  onLeave={() => onLeaveGroup?.(group.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredDiscoverGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={currentUserId}
                onSelect={() => setSelectedGroup(group)}
                onJoin={() => onJoinGroup?.(group.id)}
                isDiscover
              />
            ))}
          </div>

          {filteredDiscoverGroups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No groups found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          currentUserId={currentUserId}
          onClose={() => setSelectedGroup(null)}
          onJoin={() => onJoinGroup?.(selectedGroup.id)}
          onLeave={() => onLeaveGroup?.(selectedGroup.id)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            onCreateGroup?.(data)
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function GroupCard({
  group,
  currentUserId,
  onSelect,
  onJoin,
  onLeave,
  isDiscover = false,
}: {
  group: StudyGroupData
  currentUserId: string
  onSelect: () => void
  onJoin?: () => void
  onLeave?: () => void
  isDiscover?: boolean
}) {
  const isMember = group.members.some((m) => m.id === currentUserId)
  const onlineCount = group.members.filter((m) => m.isOnline).length

  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {group.name}
              {group.isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </div>
          <Badge variant="secondary">{group.subject}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-muted-foreground">
              {group.members.length}/{group.maxMembers}
            </span>
          </div>
          <span className="text-green-500">{onlineCount} online</span>
        </div>

        {group.nextSession && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Next: {group.nextSession.title}</span>
          </div>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isDiscover ? (
            <Button className="flex-1" onClick={onJoin}>
              Join Group
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button variant="outline" className="flex-1">
                <Video className="h-4 w-4 mr-2" />
                Meet
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GroupDetailModal({
  group,
  currentUserId,
  onClose,
  onJoin,
  onLeave,
}: {
  group: StudyGroupData
  currentUserId: string
  onClose: () => void
  onJoin?: () => void
  onLeave?: () => void
}) {
  const isMember = group.members.some((m) => m.id === currentUserId)
  const currentMember = group.members.find((m) => m.id === currentUserId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{group.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
          <CardDescription>{group.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Members */}
          <div>
            <h3 className="font-semibold mb-3">
              Members ({group.members.length}/{group.maxMembers})
            </h3>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {member.name}
                      {member.role === "owner" && <Crown className="h-4 w-4 text-yellow-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {group.recentActivity.map((activity, index) => (
                <div key={index} className="text-sm p-2 bg-muted/50 rounded-lg">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.content}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isMember ? (
              <>
                <Button className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                <Button variant="outline" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
                {currentMember?.role === "owner" && (
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="destructive" onClick={onLeave}>
                  Leave
                </Button>
              </>
            ) : (
              <Button className="flex-1" onClick={onJoin}>
                Join This Group
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateGroupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: Partial<StudyGroupData>) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({ name, description, subject, isPrivate, maxMembers })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Create Study Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Calculus Study Club"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your group about?"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Calculus, Algebra"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Private Group</label>
              <Button
                type="button"
                variant={isPrivate ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Group
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Sample data generator
export function generateSampleGroups(): StudyGroupData[] {
  return [
    {
      id: "group-1",
      name: "Calculus Masters",
      description: "Advanced calculus study group for college students",
      subject: "Calculus",
      isPrivate: false,
      maxMembers: 20,
      createdAt: new Date(),
      members: [
        { id: "user-1", name: "Alex Chen", role: "owner", joinedAt: new Date(), isOnline: true },
        { id: "user-2", name: "Sarah Johnson", role: "admin", joinedAt: new Date(), isOnline: true },
        { id: "user-3", name: "Michael Wang", role: "member", joinedAt: new Date(), isOnline: false },
      ],
      nextSession: {
        title: "Integration Techniques",
        scheduledAt: new Date(Date.now() + 86400000),
      },
      recentActivity: [
        { type: "message", user: "Alex", content: "shared a practice problem", timestamp: new Date() },
        { type: "session", user: "Sarah", content: "scheduled a new study session", timestamp: new Date() },
      ],
    },
    {
      id: "group-2",
      name: "Physics Problem Solvers",
      description: "Work through physics problems together",
      subject: "Physics",
      isPrivate: true,
      maxMembers: 15,
      createdAt: new Date(),
      members: [
        { id: "user-4", name: "Emma Davis", role: "owner", joinedAt: new Date(), isOnline: false },
        { id: "user-5", name: "James Wilson", role: "member", joinedAt: new Date(), isOnline: true },
      ],
      recentActivity: [
        { type: "resource", user: "Emma", content: "uploaded study notes", timestamp: new Date() },
      ],
    },
  ]
}
