# Implementation Plan

- [ ] 1. Set up core data models and types

  - Create TypeScript interfaces for Job, PipelineStage, StageTransition, Note, and Communication
  - Define PIPELINE_STAGES constant array
  - Set up proper type exports in types/job-tracker.d.ts
  - _Requirements: 1.1, 3.1, 4.1_

- [ ] 2. Create Pinia store foundation

  - [ ] 2.1 Implement basic useJobPipelineStore structure

    - Set up store with initial state (jobs, loading, error, searchQuery, selectedJobId)
    - Implement basic getters (jobsByStage, selectedJob, jobCount)
    - Create store file in stores/jobPipeline.ts
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ] 2.2 Add CRUD actions to store

    - Implement fetchJobs, createJob, updateJob, deleteJob actions
    - Add proper error handling and loading states
    - Include optimistic updates for updateJobStage action
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 2.3 Add search and selection functionality
    - Implement setSearchQuery action and filtered jobsByStage getter
    - Add selectJob action for modal integration
    - Test search filtering logic
    - _Requirements: 1.6, 3.7_

- [ ] 3. Build server API endpoints

  - [ ] 3.1 Create jobs API routes structure

    - Implement GET /api/jobs (fetch all jobs)
    - Implement POST /api/jobs (create new job)
    - Add proper TypeScript types for API responses
    - _Requirements: 1.1, 1.2_

  - [ ] 3.2 Add individual job management endpoints
    - Implement GET /api/jobs/[id] (fetch specific job)
    - Implement PATCH /api/jobs/[id] (update job, including stage changes)
    - Implement DELETE /api/jobs/[id] (delete job)
    - Add proper error handling and validation
    - _Requirements: 1.2, 2.2, 4.1_

- [ ] 4. Create drag-and-drop composable

  - Implement useDragAndDrop composable with Pinia store integration
  - Add drag state management (draggedJob, dragOverColumn, isDragging)
  - Create drag event handlers (handleDragStart, handleDragOver, handleDrop, handleDragEnd)
  - Include proper error handling for failed drag operations
  - _Requirements: 2.2, 3.2_

- [ ] 5. Build JobCard component

  - [ ] 5.1 Create basic JobCard structure

    - Implement component with proper props definition using defineProps<{job: Job}>()
    - Add drag event handlers and draggable attribute
    - Display key job information (company, title, days in stage)
    - _Requirements: 2.1, 3.7_

  - [ ] 5.2 Add JobCard interactions and styling
    - Implement drag visual feedback and states
    - Add click handler to emit openDetails event
    - Style card with priority badges and status indicators
    - Add proper TypeScript emits definition
    - _Requirements: 2.2, 3.7_

- [ ] 6. Build KanbanColumn component

  - [ ] 6.1 Create column structure and drop zones

    - Implement component with defineProps<{stage: PipelineStage, title: string}>()
    - Add drop zone event handlers (dragover, dragleave, drop)
    - Display column header with title and job count badge
    - _Requirements: 2.1, 2.2, 3.1, 3.5_

  - [ ] 6.2 Integrate column with store and drag system
    - Connect to Pinia store to get jobs for specific stage
    - Add visual feedback for drag over states
    - Implement scroll handling for many job cards
    - Style column with proper spacing and responsive design
    - _Requirements: 2.2, 3.2, 3.5_

- [ ] 7. Build KanbanBoard main component

  - [ ] 7.1 Create board layout and structure

    - Implement main container component without props (uses Pinia store directly)
    - Create responsive CSS Grid layout for columns
    - Add search input connected to store's setSearchQuery action
    - _Requirements: 1.6, 3.1, 3.5_

  - [ ] 7.2 Integrate board with drag system and store
    - Connect useDragAndDrop composable for coordinating drag operations
    - Add error handling with toast notifications
    - Implement loading states and error display
    - Wire up all PIPELINE_STAGES to create columns dynamically
    - _Requirements: 2.2, 3.2, 3.5_

- [ ] 8. Create JobDetailModal component

  - [ ] 8.1 Build modal structure and form

    - Implement component with defineProps<{jobId: string | null}>() and defineModel<boolean>() for isOpen
    - Create form for editing job details with proper validation
    - Display job information, stage history, and notes
    - _Requirements: 4.1, 4.2, 4.6_

  - [ ] 8.2 Add modal functionality and integration
    - Connect to Pinia store to get job data by ID
    - Implement save functionality using store's updateJob action
    - Add notes and communication history display with add/edit capabilities
    - Include proper form validation and error handling
    - _Requirements: 4.1, 4.2, 4.6_

- [ ] 9. Wire everything together and add final features

  - [ ] 9.1 Create main page integration

    - Set up page component that uses KanbanBoard
    - Add job creation functionality (floating action button or header button)
    - Connect JobDetailModal to board interactions
    - _Requirements: 1.1, 1.2, 3.1_

  - [ ] 9.2 Add polish and final integrations
    - Implement proper loading states throughout the application
    - Add toast notifications for all user actions
    - Test complete user workflows (create, edit, drag, delete jobs)
    - Add keyboard navigation support for accessibility
    - _Requirements: 1.6, 2.2, 3.7, 4.6_

- [ ] 10. Testing and validation
  - Write unit tests for Pinia store actions and getters
  - Test drag-and-drop functionality across different scenarios
  - Validate API endpoints with proper error cases
  - Test complete user workflows end-to-end
  - _Requirements: All requirements validation_
