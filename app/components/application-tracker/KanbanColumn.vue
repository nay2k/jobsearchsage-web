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
}>();

// Set up FormKit drag and drop with built-in onTransfer event
const [columnRef, applications] = useDragAndDrop(props.applications, {
  group: 'kanban', // All columns share the same group for transferability
  onTransfer: (event: any) => {
    console.log('Transfer event:', event);

    // When an item is transferred TO this column
    if (event.targetData && event.targetData.parent === columnRef.value) {
      const transferredItem = event.data as JobApplication;
      console.log(`Item transferred to ${props.stage}:`, transferredItem.title);

      // Emit event to parent to handle the API call
      emit('moveApplication', transferredItem, props.stage);
    }
  },
});

// Watch for changes in props and update the applications array
watch(
  () => props.applications,
  (newApplications) => {
    applications.value = [...newApplications];
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-80 flex-shrink-0 h-full"
  >
    <!-- Column Header -->
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg"
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

    <!-- Column Body - This is the draggable container -->
    <div ref="columnRef" class="flex-1 p-3 space-y-3 overflow-y-auto min-h-32">
      <!-- Job Application Cards - These are the draggable items -->
      <JobApplicationCard
        v-for="jobApplication in applications"
        :key="jobApplication.id"
        :job-application="jobApplication"
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
