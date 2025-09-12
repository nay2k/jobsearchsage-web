<script setup lang="ts">
import type { PipelineStage, JobApplication } from '#shared/types/job-tracker';
import { useDragAndDrop } from '@formkit/drag-and-drop/vue';
import JobApplicationCard from './JobApplicationCard.vue';

const props = defineProps<{
  stage: PipelineStage;
  title: string;
  applications: JobApplication[];
}>();

const emit = defineEmits<{
  moveApplication: [application: JobApplication, targetStage: PipelineStage];
  jobSelected: [job: JobApplication];
}>();

// Track if we're currently processing a move to prevent interference
const isProcessingMove = ref(false);

// Set up FormKit drag and drop
const [columnRef, applications] = useDragAndDrop(props.applications, {
  group: 'kanban',
  onTransfer: async ({ data }) => {
    const transferredItem = data.value as JobApplication;

    // Only emit if the item's current stage is different from this column's stage
    if (transferredItem.stage !== props.stage) {
      console.log(`Item transferred to ${props.stage}:`, transferredItem.title);

      // Set flag to prevent watcher interference
      isProcessingMove.value = true;

      try {
        emit('moveApplication', transferredItem, props.stage);

        // Wait a bit for the API call to complete
        await nextTick();
        setTimeout(() => {
          isProcessingMove.value = false;
        }, 500);
      } catch (error) {
        isProcessingMove.value = false;
        throw error;
      }
    }
  },
});

// Watch for changes in props and update the applications array
// Only update if we're not currently processing a move
watch(
  () => props.applications,
  (newApplications) => {
    if (!isProcessingMove.value) {
      applications.value = [...newApplications];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-90 flex-shrink-0"
  >
    <!-- Column Header - Fixed -->
    <div
      class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <UBadge
          :label="applications.length.toString()"
          color="neutral"
          variant="soft"
          size="md"
        />
      </div>
    </div>

    <!-- Column Body - Scrollable -->
    <div
      ref="columnRef"
      class="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden min-h-0"
    >
      <!-- Job Application Cards - These are the draggable items -->
      <JobApplicationCard
        v-for="jobApplication in applications"
        :key="jobApplication.id"
        :job-application="jobApplication"
        @click="emit('jobSelected', jobApplication)"
      />

      <!-- Empty state for columns with no jobs -->
      <div
        v-if="applications.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <UIcon
          name="i-lucide-briefcase"
          class="h-8 w-8 text-gray-300 dark:text-gray-600"
        />
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          No applications
        </p>
      </div>
    </div>
  </div>
</template>
