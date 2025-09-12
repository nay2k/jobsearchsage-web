<script setup lang="ts">
import {
  PIPELINE_STAGES,
  type JobApplication,
  type PipelineStage,
} from '#shared/types/job-tracker';
import KanbanColumn from './KanbanColumn.vue';

// Props received from parent page
defineProps<{
  loading: boolean;
  searchQuery: string;
  jobApplicationsByStage: Record<PipelineStage, JobApplication[]>;
}>();

// Events emitted to parent page
const emit = defineEmits<{
  'search-input': [event: Event];
  'move-application': [application: JobApplication, targetStage: PipelineStage];
}>();

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

// Handle search input
function handleSearchInput(event: Event) {
  emit('search-input', event);
}

// Handle job application moves between stages
function handleMoveApplication(
  application: JobApplication,
  targetStage: PipelineStage
) {
  emit('move-application', application, targetStage);
}
</script>

<template>
  <div class="w-full h-full pr-2">
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
      v-if="
        loading &&
        Object.values(jobApplicationsByStage).every((apps) => apps.length === 0)
      "
      class="flex items-center justify-center h-64"
    >
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-circle"
          class="h-8 w-8 animate-spin mx-auto mb-4 text-primary-500"
        />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Loading applications...
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
          This may take a moment
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
