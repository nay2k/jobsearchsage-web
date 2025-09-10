// Job Application Tracker Type Definitions

export type PipelineStage
  = | 'researched'
    | 'applied'
    | 'phone_screen'
    | 'interview'
    | 'final'
    | 'offer'
    | 'rejected'
    | 'withdrawn'

export const PIPELINE_STAGES: PipelineStage[] = [
  'researched',
  'applied',
  'phone_screen',
  'interview',
  'final',
  'offer',
  'rejected',
  'withdrawn'
]

export interface JobApplication {
  id: string
  title: string
  company: string
  location?: string
  url?: string // Link to original job posting
  description?: string // Job description/requirements (preserved copy)
  salaryRange?: string
  applicationDeadline?: Date
  stage: PipelineStage
  dateAdded: Date
  stageHistory: StageTransition[]
  notes: Note[]
  communications: Communication[]
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  source: string // LinkedIn, company website, etc.
}

export interface StageTransition {
  id: string
  fromStage: PipelineStage | null
  toStage: PipelineStage
  timestamp: Date
  notes?: string
}

export interface Note {
  id: string
  content: string
  timestamp: Date
  type: 'general' | 'interview' | 'research' | 'follow_up'
}

export interface Communication {
  id: string
  type: 'email' | 'phone' | 'meeting' | 'message'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  timestamp: Date
  contactPerson?: string
}

// API Response Types
export interface JobApplicationResponse {
  data: JobApplication[]
  total: number
  page?: number
  limit?: number
}

export interface CreateJobApplicationRequest {
  title: string
  company: string
  location?: string
  url?: string
  description?: string
  salaryRange?: string
  applicationDeadline?: Date
  tags?: string[]
  priority?: 'low' | 'medium' | 'high'
  source?: string
}

export interface UpdateJobApplicationRequest {
  title?: string
  company?: string
  location?: string
  url?: string
  description?: string
  salaryRange?: string
  applicationDeadline?: Date
  stage?: PipelineStage
  tags?: string[]
  priority?: 'low' | 'medium' | 'high'
  source?: string
}

// Store State Types
export interface JobApplicationStoreState {
  jobApplications: JobApplication[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedJobApplicationId: string | null
}

// Component Props Types
export interface JobApplicationCardProps {
  jobApplication: JobApplication
}

export interface KanbanColumnProps {
  stage: PipelineStage
  title: string
}

export interface JobApplicationDetailModalProps {
  jobApplicationId: string | null
}

// Drag and Drop Types
export interface DragState {
  draggedJobApplication: JobApplication | null
  dragOverColumn: PipelineStage | null
  isDragging: boolean
}
