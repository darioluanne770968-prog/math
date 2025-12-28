// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Video types
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Subject = 'math' | 'physics' | 'chemistry' | 'accounting';

export interface Video {
  id: string;
  user_id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string | null;
  playback_id: string | null;
  status: VideoStatus;
  subject: Subject;
  created_at: string;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

// Subject configuration
export interface SubjectConfig {
  id: Subject;
  name: string;
  displayName: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'math',
    name: 'MathGPT',
    displayName: 'Math',
    color: '#10b981',
    bgColor: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
  },
  {
    id: 'physics',
    name: 'PhysicsGPT',
    displayName: 'Physics',
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  {
    id: 'chemistry',
    name: 'ChemGPT',
    displayName: 'Chemistry',
    color: '#8b5cf6',
    bgColor: 'bg-violet-500',
    hoverColor: 'hover:bg-violet-600',
  },
  {
    id: 'accounting',
    name: 'AccountingGPT',
    displayName: 'Accounting',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
  },
];

// Navigation item type
export interface NavItem {
  name: string;
  href: string;
  icon: string;
}
