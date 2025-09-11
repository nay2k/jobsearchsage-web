<script setup lang="ts">
import {
  PIPELINE_STAGES,
  type JobApplication,
  type PipelineStage,
} from '#shared/types/job-tracker';
import { useJobApplicationStore } from '~/stores/useJobApplicationStore';
import { storeToRefs } from 'pinia';
import { useJobApplicationDragAndDrop } from '~/composables/useDragAndDrop';
import KanbanColumn from './KanbanColumn.vue';

// Initialize store
const jobApplicationStore = useJobApplicationStore();

// Get reactive state from store
const { loading, error, searchQuery, jobApplicationsByStage } =
  storeToRefs(jobApplicationStore);

// Get actions from store
const { fetchJobApplications, setSearchQuery, clearError } =
  jobApplicationStore;

// Get the move function from our composable
const { moveJobApplication } = useJobApplicationDragAndDrop();

// Static stage titles for display
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

// Initialize data on component mount
onMounted(async () => {
  try {
    await fetchJobApplications();
  } catch (err) {
    console.error('Failed to load job applications:', err);
  }
});

// Handle search input
function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  setSearchQuery(target.value);
}

// Clear error when user interacts
function handleClearError() {
  clearError();
}

// Handle job application moves between stages
async function handleMoveApplication(
  application: JobApplication,
  targetStage: PipelineStage
) {
  console.log(
    `Moving "${application.title}" from ${application.stage} to ${targetStage}`
  );

  try {
    await moveJobApplication(application, targetStage);
    console.log('Successfully moved job application');
  } catch (error) {
    console.error('Failed to move job application:', error);
    // Error is already handled by the store and displayed in the UI
  }
}
</script>

<template>
  <div class="w-full h-full pr-2">
    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link' }"
      class="mb-4"
      @close="handleClearError"
    />

    <!-- Board Header -->
    <div
      class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Application Pipeline
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Drag and drop applications between stages
        </p>
      </div>

      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <UInput
          :model-value="searchQuery"
          placeholder="Search applications..."
          icon="i-lucide-search"
          size="md"
          :loading="loading"
          @input="handleSearchInput"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && !jobApplicationStore.jobApplications.length"
      class="flex items-center justify-center h-64"
    >
      <div class="text-center">
        <USkeleton class="h-8 w-8 rounded-full mx-auto mb-4" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Loading applications...
        </p>
      </div>
    </div>

    <!-- Kanban Columns Container -->
    <div
      v-else
      class="overflow-x-auto overflow-y-hidden pb-4"
      style="height: calc(100vh - 200px)"
    >
      <div class="flex gap-4 h-full" style="width: max-content">
        <KanbanColumn
          v-for="stage in PIPELINE_STAGES"
          :key="stage"
          :stage="stage"
          :title="stageDisplayNames[stage]"
          :applications="jobApplicationsByStage[stage] || []"
          @move-application="handleMoveApplication"
        />
      </div>
    </div>
  </div>
</template>
