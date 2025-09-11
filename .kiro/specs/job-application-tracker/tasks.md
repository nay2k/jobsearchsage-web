# Implementation Plan

- [x] 1. Set up core data models and types

  - Create TypeScript interfaces for JobApplication, PipelineStage, StageTransition, Note, and Communication
  - Define PIPELINE_STAGES constant array
  - Set up proper type exports in types/job-tracker.d.ts
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 2. Create Pinia store foundation

  - [x] 2.1 Implement basic useJobApplicationStore structure

    - Set up store with initial state (jobApplications, loading, error, searchQuery, selectedJobApplicationId)
    - Implement basic getters (jobApplicationsByStage, selectedJobApplication, jobApplicationCount)
    - Create store file in stores/useJobApplicationStore.ts
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 2.2 Add CRUD actions to store

    - Implement fetchJobApplications, createJobApplication, updateJobApplication, deleteJobApplication actions
    - Add proper error handling and loading states
    - Include optimistic updates for updateJobApplicationStage action
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 2.3 Add search and selection functionality
    - Implement setSearchQuery action and filtered jobApplicationsByStage getter
    - Add selectJobApplication action for modal integration
    - Test search filtering logic
    - _Requirements: 1.6, 3.7_

- [x] 3. Build server API endpoints

  - [x] 3.1 Create job applications API routes structure

    - Implement GET /api/job-applications (fetch all job applications)
    - Implement POST /api/job-applications (create new job application)
    - Add proper TypeScript types for API responses
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Add individual job application management endpoints
    - Implement GET /api/job-applications/[id] (fetch specific job application)
    - Implement PATCH /api/job-applications/[id] (update job application, including stage changes)
    - Implement DELETE /api/job-applications/[id] (delete job application)
    - Add proper error handling and validation
    - _Requirements: 1.2, 2.2, 4.1_

- [x] 4. Create Application Tracker page

  - Create basic page structure at /app/pages/application-tracker.vue
  - Add page title and basic layout using Nuxt UI components
  - Set up navigation to this page from main dashboard
  - _Requirements: 1.1, 3.1_

- [ ] 5. Build static Kanban board structure

  - [x] 5.1 Create static KanbanBoard component

    - Build basic board layout with hardcoded columns
    - Create static column headers for each pipeline stage
    - Add basic responsive grid layout
    - _Requirements: 3.1, 3.5_

  - [x] 5.2 Create static JobApplicationCard component

    - Build basic card structure with hardcoded sample data
    - Display company name, job title, and basic info
    - Add basic card styling using Nuxt UI
    - _Requirements: 2.1, 3.7_

  - [x] 5.3 Create static KanbanColumn component
    - Build column container with header and card area
    - Add static sample cards to each column
    - Implement basic column styling and spacing
    - _Requirements: 3.1, 3.5_

- [ ] 6. Make columns dynamic with real data

  - [ ] 6.1 Connect KanbanBoard to Pinia store

    - Replace hardcoded columns with PIPELINE_STAGES data
    - Add store initialization and data fetching
    - Display loading states while fetching data
    - _Requirements: 2.1, 3.1_

  - [ ] 6.2 Connect KanbanColumn to store data
    - Make columns display job applications from store by stage
    - Add job count badges to column headers
    - Handle empty states when no jobs in a stage
    - _Requirements: 2.1, 3.5_

- [ ] 7. Make cards dynamic with real data

  - [ ] 7.1 Connect JobApplicationCard to real job data

    - Replace hardcoded data with props from JobApplication interface
    - Display real company names, job titles, and application dates
    - Add calculated fields like "days in stage"
    - _Requirements: 2.1, 3.7_

  - [ ] 7.2 Add search functionality
    - Implement search input in KanbanBoard header
    - Connect search to store's setSearchQuery action
    - Filter displayed cards based on search query
    - _Requirements: 1.6, 3.7_

- [ ] 8. Add drag and drop functionality

  - [ ] 8.1 Create useDragAndDrop composable

    - Implement drag state management (draggedJob, dragOverColumn, isDragging)
    - Create drag event handlers (handleDragStart, handleDragOver, handleDrop, handleDragEnd)
    - Include proper error handling for failed drag operations
    - _Requirements: 2.2, 3.2_

  - [ ] 8.2 Add drag interactions to components
    - Make JobApplicationCard draggable with drag event handlers
    - Add drop zones to KanbanColumn components
    - Implement visual feedback during drag operations
    - _Requirements: 2.2, 3.2_

- [ ] 9. Add styling and polish to cards

  - [ ] 9.1 Enhanced card styling

    - Add priority badges and status indicators
    - Implement hover states and visual feedback
    - Add proper spacing and typography
    - _Requirements: 3.7_

  - [ ] 9.2 Add card interactions
    - Add click handler to open job application details
    - Implement proper drag visual feedback and states
    - Add keyboard navigation support for accessibility
    - _Requirements: 2.2, 3.7_

- [ ] 10. Create JobApplicationDetailModal

  - [ ] 10.1 Build modal structure and form

    - Implement component with proper props for job application ID
    - Create form for editing job application details with validation
    - Display job application information and stage history
    - _Requirements: 4.1, 4.2, 4.6_

  - [ ] 10.2 Add modal functionality and integration
    - Connect to Pinia store to get job application data by ID
    - Implement save functionality using store's updateJobApplication action
    - Add notes and communication history display with add/edit capabilities
    - _Requirements: 4.1, 4.2, 4.6_

- [ ] 11. Final integration and polish

  - [ ] 11.1 Wire modal to board interactions

    - Connect JobApplicationDetailModal to card click events
    - Add job application creation functionality (floating action button)
    - Implement proper modal state management
    - _Requirements: 1.2, 4.1_

  - [ ] 11.2 Add final polish and error handling
    - Implement toast notifications for all user actions
    - Add comprehensive loading states throughout the application
    - Test complete user workflows (create, edit, drag, delete job applications)
    - _Requirements: 1.6, 2.2, 4.6_

- [ ] 12. Testing and validation
  - Write unit tests for Pinia store actions and getters
  - Test drag-and-drop functionality across different scenarios
  - Validate API endpoints with proper error cases
  - Test complete user workflows end-to-end
  - _Requirements: All requirements validation_
