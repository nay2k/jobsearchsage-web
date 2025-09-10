<script setup lang="ts">
import { PIPELINE_STAGES } from '#shared/types/job-tracker';

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

// Static sample data for demonstration
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
  <div class="w-full h-full">
    <!-- Board Header -->
    <div
      class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Application Pipeline
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Drag and drop applications between stages
        </p>
      </div>

      <!-- Search Input (static for now) -->
      <div class="w-full sm:w-80">
        <UInput
          placeholder="Search applications..."
          icon="i-lucide-search"
          size="sm"
        />
      </div>
    </div>

    <!-- Kanban Columns Container -->
    <div
      class="overflow-x-auto overflow-y-hidden pb-4"
      style="height: calc(100vh - 200px)"
    >
      <div class="flex gap-4 h-full" style="width: max-content">
        <div
          v-for="stage in PIPELINE_STAGES"
          :key="stage"
          class="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-80 flex-shrink-0 h-full"
        >
          <!-- Column Header -->
          <div
            class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ stageDisplayNames[stage] }}
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
            <!-- Placeholder cards for static display -->
            <div
              v-for="i in sampleJobCounts[stage]"
              :key="`${stage}-${i}`"
              class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-white truncate"
                  >
                    Sample Job {{ i }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                    Company Name {{ i }}
                  </p>
                </div>
                <UBadge
                  label="High"
                  color="error"
                  variant="soft"
                  size="xs"
                  class="ml-2 flex-shrink-0"
                />
              </div>

              <div
                class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
              >
                <span>{{ Math.floor(Math.random() * 10) + 1 }} days ago</span>
                <span
                  >{{ Math.floor(Math.random() * 5) + 1 }} days in stage</span
                >
              </div>
            </div>

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
      </div>
    </div>
  </div>
</template>
