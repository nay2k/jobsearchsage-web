<script setup lang="ts">
import type { JobApplication, PipelineStage } from '#shared/types/job-tracker';
import { useJobApplicationDragAndDrop } from '~/composables/useDragAndDrop';
import { storeToRefs } from 'pinia';

const isDetialViewOpen = ref(true);

// Function to close the detail panel
function closeDetailPanel() {
  isDetialViewOpen.value = false;
  selectedJob.value = null;
}

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
const { openNewJobApplicationSlideover } = useJobApplicationTracker();

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

// Reactive selected job property
const selectedJob = ref<JobApplication | null>(null);

// Function to handle job selection
function handleJobSelection(job: JobApplication) {
  selectedJob.value = job;
  isDetialViewOpen.value = true;
}

// Load data on page mount
onMounted(async () => {
  try {
    await fetchJobApplications();
    // Select the first job application by default for testing
    if (jobApplications.value.length > 0) {
      selectedJob.value = jobApplications.value[0];
    }
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
    const newJobApplication = await createJobApplication(jobData);

    // Select the newly created job application
    selectedJob.value = newJobApplication;
    isDetialViewOpen.value = true;

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

    // Close the detail panel after successful deletion
    closeDetailPanel();

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

    // Update the selected job with the refreshed data
    if (selectedJob.value) {
      const updatedJob = jobApplications.value.find(
        (job) => job.id === selectedJob.value?.id
      );
      if (updatedJob) {
        selectedJob.value = updatedJob;
      }
    }

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

    // Update the selected job with the refreshed data
    if (selectedJob.value) {
      const updatedJob = jobApplications.value.find(
        (job) => job.id === selectedJob.value?.id
      );
      if (updatedJob) {
        selectedJob.value = updatedJob;
      }
    }

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
  <UDashboardPanel id="app-tracker">
    <template #header>
      <UDashboardNavbar title="Application Tracker">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex gap-6">
            <UInput
              :model-value="searchQuery"
              placeholder="Search applications..."
              icon="i-lucide-search"
              size="md"
              :loading="isLoading"
              @input="handleSearchInput"
            />
            <UButton
              color="primary"
              variant="solid"
              size="md"
              icon="i-lucide-plus"
              label="Add Job Application"
              @click="handleCreateJobApplication"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        class="w-full grid gap-4 h-full"
        :class="[
          isDetialViewOpen ? 'grid-cols-[65%_35%]' : 'grid-cols-[100%_0%]',
        ]"
      >
        <div class="">
          <!-- Kanban Board -->
          <ApplicationTrackerKanbanBoard
            :loading="loading"
            :search-query="searchQuery"
            :job-applications-by-stage="jobApplicationsByStage"
            @search-input="handleSearchInput"
            @move-application="handleMoveApplication"
            @job-selected="handleJobSelection"
          />
        </div>
        <div
          v-if="isDetialViewOpen && selectedJob"
          class="bg-blue-50 rounded-md h-full border border-green-300"
        >
          <ApplicationTrackerJobApplicaitonDetail
            :selected-job-application="selectedJob"
            :loading="loading"
            @job-created="handleJobCreated"
            @job-updated="handleJobUpdated"
            @job-deleted="handleJobDeleted"
            @note-added="handleNoteAdded"
            @communication-added="handleCommunicationAdded"
            @close="closeDetailPanel"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
