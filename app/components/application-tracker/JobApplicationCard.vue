<script setup lang="ts">
import type { JobApplication } from '~/types/job-tracker';

// For now, using hardcoded sample data as per task requirements
const sampleJobApplication: JobApplication = {
  id: 'sample-1',
  title: 'Senior Frontend Developer',
  company: 'TechCorp Inc.',
  location: 'San Francisco, CA',
  url: 'https://example.com/job',
  salaryRange: '$120,000 - $150,000',
  stage: 'applied',
  dateAdded: new Date('2024-01-15'),
  stageHistory: [],
  notes: [],
  communications: [],
  tags: ['Vue.js', 'TypeScript', 'Remote'],
  priority: 'high',
  source: 'LinkedIn',
};

// Calculate days in current stage
const daysInStage = computed(() => {
  const now = new Date();
  const stageDate = sampleJobApplication.dateAdded;
  const diffTime = Math.abs(now.getTime() - stageDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Format date for display
const formattedDate = computed(() => {
  return sampleJobApplication.dateAdded.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
});

// Priority color mapping using valid Nuxt UI colors
const priorityColor = computed(() => {
  switch (sampleJobApplication.priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'neutral';
    default:
      return 'neutral';
  }
});
</script>

<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 p-4"
  >
    <!-- Card Header with Company and Priority -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3
          class="text-sm font-semibold text-gray-900 dark:text-white truncate"
        >
          {{ sampleJobApplication.company }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
          {{ sampleJobApplication.title }}
        </p>
      </div>
      <UBadge
        :color="priorityColor"
        variant="soft"
        size="sm"
        class="ml-2 flex-shrink-0"
      >
        {{ sampleJobApplication.priority }}
      </UBadge>
    </div>

    <!-- Location and Salary -->
    <div class="space-y-2 mb-3">
      <div
        v-if="sampleJobApplication.location"
        class="flex items-center text-xs text-gray-600 dark:text-gray-300"
      >
        <UIcon name="i-lucide-map-pin" class="w-3 h-3 mr-1 flex-shrink-0" />
        <span class="truncate">{{ sampleJobApplication.location }}</span>
      </div>

      <div
        v-if="sampleJobApplication.salaryRange"
        class="flex items-center text-xs text-gray-600 dark:text-gray-300"
      >
        <UIcon name="i-lucide-credit-card" class="w-3 h-3 mr-1 flex-shrink-0" />
        <span class="truncate">{{ sampleJobApplication.salaryRange }}</span>
      </div>
    </div>

    <!-- Tags -->
    <div
      v-if="sampleJobApplication.tags.length > 0"
      class="flex flex-wrap gap-1 mb-3"
    >
      <UBadge
        v-for="tag in sampleJobApplication.tags.slice(0, 3)"
        :key="tag"
        color="primary"
        variant="soft"
        size="sm"
      >
        {{ tag }}
      </UBadge>
      <UBadge
        v-if="sampleJobApplication.tags.length > 3"
        color="neutral"
        variant="soft"
        size="md"
      >
        +{{ sampleJobApplication.tags.length - 3 }}
      </UBadge>
    </div>

    <!-- Footer with Date and Days in Stage -->
    <div
      class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700"
    >
      <div class="flex items-center">
        <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
        <span>{{ formattedDate }}</span>
      </div>
      <div class="flex items-center">
        <UIcon name="i-lucide-clock" class="w-3 h-3 mr-1" />
        <span>{{ daysInStage }} days</span>
      </div>
    </div>
  </UCard>
</template>
