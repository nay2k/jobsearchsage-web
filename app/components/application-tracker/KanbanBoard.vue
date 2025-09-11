<script setup lang="ts">
import { PIPELINE_STAGES } from '#shared/types/job-tracker';
import KanbanColumn from './KanbanColumn.vue';

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
          size="md"
        />
      </div>
    </div>

    <!-- Kanban Columns Container -->
    <div
      class="overflow-x-auto overflow-y-hidden pb-4"
      style="height: calc(100vh - 200px)"
    >
      <div class="flex gap-4 h-full" style="width: max-content">
        <KanbanColumn
          v-for="stage in PIPELINE_STAGES"
          :key="stage"
          :stage="stage"
          :title="stageDisplayNames[stage]"
        />
      </div>
    </div>
  </div>
</template>
