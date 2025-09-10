# Design Document

## Overview

The Job Application Tracker is built as a Kanban-style pipeline management system using Vue 3 with drag-and-drop functionality. The system provides visual job application tracking through a card-based interface with smooth interactions and application management capabilities.

## Architecture

### Frontend Architecture

```
components/
└── jobapplicationtracker/
    ├── KanbanBoard.vue           # Main board container
    ├── KanbanColumn.vue          # Individual stage columns
    ├── JobApplicationCard.vue    # Draggable job application cards
    └── JobApplicationDetailModal.vue # Detailed application view
stores/
└── jobApplicationPipeline.ts     # Pinia store for job application pipeline state and API calls
composables/
└── useDragAndDrop.ts             # Drag-and-drop logic composable
types/
└── job-tracker.d.ts              # TypeScript definitions
```

### Backend Architecture

```
server/api/job-applications/
├── index.get.ts                  # Get all job applications
├── index.post.ts                 # Create new job application
├── [id].get.ts                   # Get specific job application
├── [id].patch.ts                 # Update job application (stage changes)
└── [id].delete.ts                # Delete job application
```

## Components and Interfaces

### Core Components

#### KanbanBoard.vue

Main container component that orchestrates the entire pipeline view. Uses Pinia store for state management.

**Props:** None (gets data from Pinia store)

**Features:**

- Responsive column layout using CSS Grid
- Global search and filtering
- Integrates with `useJobPipelineStore()` for state management
- Handles drag-and-drop coordination between columns

#### KanbanColumn.vue

Individual stage columns with drag-and-drop zones.

**Props:**

```typescript
defineProps<{
  stage: PipelineStage;
  title: string;
}>();
```

**Features:**

- Drop zone highlighting with visual feedback
- Job count badges in column headers
- Scroll handling for many jobs
- Gets filtered jobs from Pinia store based on stage

#### JobApplicationCard.vue

Draggable cards representing individual job applications.

**Props:**

```typescript
defineProps<{
  jobApplication: JobApplication;
}>();
```

**Emits:**

```typescript
const emit = defineEmits<{
  dragStart: [jobApplication: JobApplication];
  dragEnd: [];
  openDetails: [jobApplication: JobApplication];
}>();
```

**Features:**

- Drag handle and visual feedback
- Key job application information display (company, title, days in stage)
- Status indicators and priority badges
- Click to open details modal

#### JobApplicationDetailModal.vue

Comprehensive job application details and history view.

**Props:**

```typescript
defineProps<{
  jobApplicationId: string | null;
}>();
```

**Model:**

```typescript
const isOpen = defineModel<boolean>();
```

**Features:**

- Complete job application information display and editing
- Stage history timeline
- Notes and communication log with add/edit capabilities
- Form validation and error handling
- Gets job application data from Pinia store by ID

### Pinia Store Design

#### useJobApplicationPipelineStore

Central store for managing job application pipeline state and API interactions.

```typescript
// stores/jobApplicationPipeline.ts
export const useJobApplicationPipelineStore = defineStore(
  'jobApplicationPipeline',
  () => {
    // State
    const jobApplications = ref<JobApplication[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const selectedJobApplicationId = ref<string | null>(null);

    // Getters
    const jobApplicationsByStage = computed(() => {
      const filtered = jobApplications.value.filter(
        (jobApplication) =>
          jobApplication.title
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          jobApplication.company
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())
      );

      return PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage] = filtered.filter(
          (jobApplication) => jobApplication.stage === stage
        );
        return acc;
      }, {} as Record<PipelineStage, JobApplication[]>);
    });

    const selectedJobApplication = computed(() =>
      selectedJobApplicationId.value
        ? jobApplications.value.find(
            (jobApplication) =>
              jobApplication.id === selectedJobApplicationId.value
          )
        : null
    );

    const jobApplicationCount = computed(() => jobApplications.value.length);

    // Actions
    async function fetchJobApplications() {
      loading.value = true;
      error.value = null;

      try {
        const response = await $fetch<JobApplication[]>(
          '/api/job-applications'
        );
        jobApplications.value = response;
      } catch (err) {
        error.value = 'Failed to fetch job applications';
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function createJobApplication(
      jobApplicationData: Omit<
        JobApplication,
        'id' | 'dateAdded' | 'stageHistory'
      >
    ) {
      try {
        const newJobApplication = await $fetch<JobApplication>(
          '/api/job-applications',
          {
            method: 'POST',
            body: jobApplicationData,
          }
        );
        jobApplications.value.push(newJobApplication);
        return newJobApplication;
      } catch (err) {
        error.value = 'Failed to create job';
        throw err;
      }
    }

    async function updateJobStage(jobId: string, newStage: PipelineStage) {
      const jobIndex = jobs.value.findIndex((job) => job.id === jobId);
      if (jobIndex === -1) return;

      // Optimistic update
      const oldStage = jobs.value[jobIndex].stage;
      jobs.value[jobIndex].stage = newStage;

      try {
        const updatedJob = await $fetch<Job>(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          body: { stage: newStage },
        });
        jobs.value[jobIndex] = updatedJob;
      } catch (err) {
        // Revert optimistic update
        jobs.value[jobIndex].stage = oldStage;
        error.value = 'Failed to update job stage';
        throw err;
      }
    }

    async function updateJob(jobId: string, updates: Partial<Job>) {
      try {
        const updatedJob = await $fetch<Job>(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          body: updates,
        });
        const jobIndex = jobs.value.findIndex((job) => job.id === jobId);
        if (jobIndex !== -1) {
          jobs.value[jobIndex] = updatedJob;
        }
        return updatedJob;
      } catch (err) {
        error.value = 'Failed to update job';
        throw err;
      }
    }

    async function deleteJob(jobId: string) {
      try {
        await $fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
        jobs.value = jobs.value.filter((job) => job.id !== jobId);
      } catch (err) {
        error.value = 'Failed to delete job';
        throw err;
      }
    }

    function setSearchQuery(query: string) {
      searchQuery.value = query;
    }

    function selectJob(jobId: string | null) {
      selectedJobId.value = jobId;
    }

    return {
      // State
      jobs: readonly(jobs),
      loading: readonly(loading),
      error: readonly(error),
      searchQuery: readonly(searchQuery),
      selectedJobId: readonly(selectedJobId),

      // Getters
      jobsByStage,
      selectedJob,
      jobCount,

      // Actions
      fetchJobs,
      createJob,
      updateJobStage,
      updateJob,
      deleteJob,
      setSearchQuery,
      selectJob,
    };
  }
);
```

### Drag and Drop Implementation

Using Vue's native drag events with custom composable that integrates with Pinia store:

```typescript
// composables/useDragAndDrop.ts
export const useDragAndDrop = () => {
  const jobApplicationPipelineStore = useJobApplicationPipelineStore();
  const draggedJobApplication = ref<JobApplication | null>(null);
  const dragOverColumn = ref<PipelineStage | null>(null);
  const isDragging = ref(false);

  const handleDragStart = (jobApplication: JobApplication) => {
    draggedJobApplication.value = jobApplication;
    isDragging.value = true;
  };

  const handleDragOver = (stage: PipelineStage) => {
    dragOverColumn.value = stage;
  };

  const handleDragLeave = () => {
    dragOverColumn.value = null;
  };

  const handleDrop = async (targetStage: PipelineStage) => {
    if (
      draggedJobApplication.value &&
      draggedJobApplication.value.stage !== targetStage
    ) {
      try {
        await jobApplicationPipelineStore.updateJobApplicationStage(
          draggedJobApplication.value.id,
          targetStage
        );
      } catch (error) {
        // Error handling is done in the store
        console.error('Failed to update job application stage:', error);
      }
    }

    // Reset drag state
    draggedJobApplication.value = null;
    dragOverColumn.value = null;
    isDragging.value = false;
  };

  const handleDragEnd = () => {
    // Reset drag state if drop didn't occur
    draggedJob.value = null;
    dragOverColumn.value = null;
    isDragging.value = false;
  };

  return {
    draggedJob: readonly(draggedJob),
    dragOverColumn: readonly(dragOverColumn),
    isDragging: readonly(isDragging),
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
```

## Data Models

### Job Application Model

```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  salaryRange?: string;
  applicationDeadline?: Date;
  stage: PipelineStage;
  dateAdded: Date;
  stageHistory: StageTransition[];
  notes: Note[];
  communications: Communication[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  source: string; // LinkedIn, company website, etc.
}

type PipelineStage =
  | 'researched'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'final'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

interface StageTransition {
  id: string;
  fromStage: PipelineStage | null;
  toStage: PipelineStage;
  timestamp: Date;
  notes?: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: 'general' | 'interview' | 'research' | 'follow_up';
}

interface Communication {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'message';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: Date;
  contactPerson?: string;
}
```

## Error Handling

### Frontend Error Handling

Error handling is centralized in the Pinia store with toast notifications:

```typescript
// In components using the store
<script setup lang="ts">
const jobPipelineStore = useJobPipelineStore()
const toast = useToast()

// Watch for errors and show toast notifications
watch(() => jobPipelineStore.error, (error) => {
  if (error) {
    toast.add({
      title: 'Error',
      description: error,
      color: 'red'
    })
  }
})

// Handle specific actions with try-catch for additional error handling
const handleCreateJob = async (jobData: Omit<Job, 'id' | 'dateAdded' | 'stageHistory'>) => {
  try {
    await jobPipelineStore.createJob(jobData)
    toast.add({
      title: 'Job created successfully',
      color: 'green'
    })
  } catch (error) {
    // Error already handled in store, just log for debugging
    console.error('Failed to create job:', error)
  }
}
</script>
```

### Backend Error Handling

```typescript
// server/api/jobs/[id].patch.ts
export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      });
    }

    const updatedJob = await updateJob(jobId, body);

    if (!updatedJob) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job not found',
      });
    }

    return updatedJob;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
```

## Testing Strategy

### Unit Testing

**Component Tests:**

- JobCard drag behavior and visual states
- KanbanColumn drop zone functionality
- JobDetailModal data display and editing
- KanbanBoard integration with Pinia store

**Store Tests:**

- useJobPipelineStore state management and API calls
- Error handling and optimistic updates
- Computed properties (jobsByStage, selectedJob)

**Composable Tests:**

- useDragAndDrop state management and store integration

### Integration Testing

**API Integration:**

- Job CRUD operations with proper error handling
- Pinia store API integration and state synchronization

### E2E Testing

**User Workflows:**

- Complete job addition and stage progression
- Drag-and-drop functionality across different browsers
- Job detail viewing and editing workflows

## Performance Considerations

### Frontend Optimization

- **Virtual scrolling** for columns with many job cards
- **Debounced search** and filtering to prevent excessive API calls
- **Optimistic updates** for immediate UI feedback during drag operations
- **Lazy loading** of job details and communication history

### Backend Optimization

- **Database indexing** on frequently queried fields (stage, dateAdded, company)
- **Pagination** for large job lists

- **Batch operations** for bulk stage updates
- **Connection pooling** for database efficiency

```

```
