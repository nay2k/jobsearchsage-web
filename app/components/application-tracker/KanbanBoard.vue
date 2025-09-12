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
  jobApplicationsByStage: Record<PipelineStage, JobApplication[]>;
}>();

// Events emitted to parent page
const emit = defineEmits<{
  'move-application': [application: JobApplication, targetStage: PipelineStage];
  'job-selected': [job: JobApplication];
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

// Handle job application moves between stages
function handleMoveApplication(
  application: JobApplication,
  targetStage: PipelineStage
) {
  emit('move-application', application, targetStage);
}
</script>

<template>
  <div class="w-full">
    <!-- Board Header -->
    <!-- <div
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
    </div> -->

    <!-- Loading State -->
    <div
      v-if="
        loading &&
        Object.values(jobApplicationsByStage).every((apps) => apps.length === 0)
      "
      class="flex items-center justify-center"
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
      style="height: calc(100vh - (var(--ui-header-height) + 1.5rem))"
    >
      <div class="flex gap-4 pb-4 h-full overflow-x-auto">
        <KanbanColumn
          v-for="stage in PIPELINE_STAGES"
          :key="stage"
          :stage="stage"
          :title="stageDisplayNames[stage]"
          :applications="jobApplicationsByStage[stage] || []"
          @move-application="handleMoveApplication"
          @job-selected="(job) => emit('job-selected', job)"
        />
      </div>
    </div>
  </div>
</template>
