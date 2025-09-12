<script setup lang="ts">
import type { JobApplication, PipelineStage } from '#shared/types/job-tracker';
import { useJobApplicationDragAndDrop } from '~/composables/useDragAndDrop';
import { storeToRefs } from 'pinia';

// Set page metadata
definePageMeta({
  title: 'Application Tracker',
  description: 'Track and manage your job applications through the pipeline',
});

// Set page title for SEO and browser tab
useSeoMeta({
  title: 'Application Tracker - JobSearchSage',
  description:
    'Manage your job applications with our Kanban-style pipeline tracker',
});

// Get slideover state for layout adjustment
const {
  isJobApplicationSlideoverOpen,
  openNewJobApplicationSlideover,
  selectedJobApplicationId,
} = useJobApplicationTracker();

// Initialize the job application store
const jobApplicationStore = useJobApplicationStore();
const { loading, searchQuery, jobApplicationsByStage, jobApplications } =
  storeToRefs(jobApplicationStore);
const {
  fetchJobApplications,
  setSearchQuery,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} = jobApplicationStore;

const toast = useToast();

// Get the selected job application
const selectedJobApplication = computed(() => {
  if (!selectedJobApplicationId.value) return null;
  return jobApplications.value.find(
    (app) => app.id === selectedJobApplicationId.value
  );
});

// Load data on page mount
onMounted(async () => {
  try {
    await fetchJobApplications();
  } catch (error) {
    console.error('Failed to load job applications:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load job applications. Please try again.',
      color: 'error',
    });
  }
});

// Handle creating a new job application
function handleCreateJobApplication() {
  openNewJobApplicationSlideover();
}

// Handle search input with debouncing
const debouncedSearch = useDebounceFn((query: string) => {
  setSearchQuery(query);
}, 300);

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  debouncedSearch(target.value);
}

// Handle job application moves between stages
async function handleMoveApplication(
  application: JobApplication,
  targetStage: PipelineStage
) {
  const { moveJobApplication } = useJobApplicationDragAndDrop();

  try {
    await moveJobApplication(application, targetStage);

    // Show success toast with stage information
    const stageDisplayNames = {
      researched: 'Researched',
      applied: 'Applied',
      phone_screen: 'Phone Screen',
      interview: 'Interview',
      final: 'Final Round',
      offer: 'Offer',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
    } as const;

    const stageDisplayName = stageDisplayNames[targetStage];
    toast.add({
      title: 'Application Moved',
      description: `"${application.title}" moved to ${stageDisplayName}`,
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to move job application:', error);

    // Show error toast
    toast.add({
      title: 'Move Failed',
      description: `Failed to move "${application.title}". Please try again.`,
      color: 'error',
    });
  }
}

// Handle job creation from detail panel
async function handleJobCreated(
  jobData: Omit<JobApplication, 'id' | 'dateAdded' | 'stageHistory'>
) {
  try {
    await createJobApplication(jobData);
    toast.add({
      title: 'Success',
      description: 'Job application created successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to create job application:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to create job application',
      color: 'error',
    });
  }
}

// Handle job updates from detail panel
async function handleJobUpdated(
  jobId: string,
  updates: Partial<JobApplication>
) {
  try {
    // Clean the updates object to ensure proper serialization
    const cleanUpdates = {
      ...updates,
      // Remove any undefined values and complex objects that shouldn't be updated directly
      stageHistory: undefined,
      notes: undefined,
      communications: undefined,
      // Ensure dates are properly formatted
      applicationDeadline: updates.applicationDeadline
        ? new Date(updates.applicationDeadline).toISOString()
        : undefined,
    };

    // Remove undefined values
    Object.keys(cleanUpdates).forEach((key) => {
      if (cleanUpdates[key as keyof typeof cleanUpdates] === undefined) {
        delete cleanUpdates[key as keyof typeof cleanUpdates];
      }
    });

    console.log('Updating job application:', jobId, cleanUpdates);

    await updateJobApplication(jobId, cleanUpdates);
    toast.add({
      title: 'Success',
      description: 'Job application updated successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to update job application:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to update job application',
      color: 'error',
    });
  }
}

// Handle job deletion from detail panel
async function handleJobDeleted(jobId: string) {
  try {
    await deleteJobApplication(jobId);
    toast.add({
      title: 'Success',
      description: 'Job application deleted successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to delete job application:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to delete job application',
      color: 'error',
    });
  }
}

// Handle note addition from detail panel
async function handleNoteAdded(
  jobId: string,
  noteData: { content: string; type: string }
) {
  try {
    await $fetch(`/api/job-applications/${jobId}/notes`, {
      method: 'POST',
      body: noteData,
    });

    // Refresh job applications to get updated data
    await fetchJobApplications();

    toast.add({
      title: 'Success',
      description: 'Note added successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to add note:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to add note',
      color: 'error',
    });
  }
}

// Handle communication addition from detail panel
async function handleCommunicationAdded(jobId: string, commData: unknown) {
  try {
    await $fetch(`/api/job-applications/${jobId}/communications`, {
      method: 'POST',
      body: commData,
    });

    // Refresh job applications to get updated data
    await fetchJobApplications();

    toast.add({
      title: 'Success',
      description: 'Communication added successfully',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to add communication:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to add communication',
      color: 'error',
    });
  }
}
</script>

<template>
  <UDashboardPanel id="application-tracker">
    <template #header>
      <UDashboardNavbar title="Job Application Tracker">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="md"
            icon="i-lucide-plus"
            label="Add Job Application"
            @click="handleCreateJobApplication"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full overflow-hidden -mx-4 -my-4">
        <!-- Main content area - Kanban Board -->
        <div
          class="transition-all duration-300 ease-in-out flex-shrink-0"
          :class="{
            'w-full p-4': !isJobApplicationSlideoverOpen,
            'w-[70%] pl-4 pr-0 py-4': isJobApplicationSlideoverOpen,
          }"
        >
          <!-- Kanban Board -->
          <ApplicationTrackerKanbanBoard
            :loading="loading"
            :search-query="searchQuery"
            :job-applications-by-stage="jobApplicationsByStage"
            @search-input="handleSearchInput"
            @move-application="handleMoveApplication"
          />
        </div>

        <!-- Job Application Detail Panel -->
        <div
          v-if="isJobApplicationSlideoverOpen"
          class="w-[30%] min-w-[400px] transition-all duration-300 ease-in-out border-l border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0"
        >
          <ApplicationTrackerJobApplicationDetailPanel
            :selected-job-application="selectedJobApplication"
            :loading="loading"
            @job-created="handleJobCreated"
            @job-updated="handleJobUpdated"
            @job-deleted="handleJobDeleted"
            @note-added="handleNoteAdded"
            @communication-added="handleCommunicationAdded"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
