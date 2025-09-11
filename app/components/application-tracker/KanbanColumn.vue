<script setup lang="ts">
import type { PipelineStage } from '#shared/types/job-tracker';
import JobApplicationCard from './JobApplicationCard.vue';

defineProps<{
  stage: PipelineStage;
  title: string;
}>();

// Static sample job counts for demonstration
const sampleJobCounts = {
  researched: 5,
  applied: 8,
  phone_screen: 3,
  interview: 2,
  final: 1,
  offer: 1,
  rejected: 0,
  withdrawn: 2,
} as const;
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
          :label="sampleJobCounts[stage].toString()"
          color="neutral"
          variant="soft"
          size="md"
        />
      </div>
    </div>

    <!-- Column Body -->
    <div class="flex-1 p-3 space-y-3 overflow-y-auto">
      <!-- Job Application Cards -->
      <JobApplicationCard
        v-for="i in sampleJobCounts[stage]"
        :key="`${stage}-${i}`"
      />

      <!-- Empty state for columns with no jobs -->
      <div
        v-if="sampleJobCounts[stage] === 0"
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
