<script setup lang="ts">
import type { JobApplication } from '#shared/types/job-tracker';

// Accept job application as prop
const props = defineProps<{
  jobApplication: JobApplication;
}>();

// Calculate days in current stage based on most recent stage transition
const daysInStage = computed(() => {
  const now = new Date();
  const stageHistory = props.jobApplication.stageHistory;

  // Find the most recent stage transition to current stage
  const currentStageTransition = stageHistory
    .filter((transition) => transition.toStage === props.jobApplication.stage)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

  // Use the timestamp of the most recent transition to current stage, or dateAdded as fallback
  const stageDate = currentStageTransition
    ? new Date(currentStageTransition.timestamp)
    : new Date(props.jobApplication.dateAdded);

  const diffTime = Math.abs(now.getTime() - stageDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Format application date for display
const formattedApplicationDate = computed(() => {
  const date = new Date(props.jobApplication.dateAdded);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});

// Get the current stage entry date for more context
const currentStageDate = computed(() => {
  const stageHistory = props.jobApplication.stageHistory;
  const currentStageTransition = stageHistory
    .filter((transition) => transition.toStage === props.jobApplication.stage)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

  if (currentStageTransition) {
    const date = new Date(currentStageTransition.timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  return formattedApplicationDate.value;
});

// Priority color mapping using valid Nuxt UI colors
const priorityColor = computed(() => {
  switch (props.jobApplication.priority) {
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

// Check if application deadline is approaching
const deadlineWarning = computed(() => {
  if (!props.jobApplication.applicationDeadline) return null;

  const deadline = new Date(props.jobApplication.applicationDeadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDeadline < 0) {
    return { text: 'Deadline passed', color: 'error' as const };
  } else if (daysUntilDeadline <= 3) {
    return {
      text: `${daysUntilDeadline} days left`,
      color: 'warning' as const,
    };
  } else if (daysUntilDeadline <= 7) {
    return {
      text: `${daysUntilDeadline} days left`,
      color: 'primary' as const,
    };
  }

  return null;
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
          {{ jobApplication.company }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
          {{ jobApplication.title }}
        </p>
      </div>
      <div class="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
        <UBadge :color="priorityColor" variant="soft" size="sm">
          {{ jobApplication.priority }}
        </UBadge>
        <UBadge
          v-if="deadlineWarning"
          :color="deadlineWarning.color"
          variant="soft"
          size="sm"
        >
          {{ deadlineWarning.text }}
        </UBadge>
      </div>
    </div>

    <!-- Location, Salary, and Source -->
    <div class="space-y-2 mb-3">
      <div
        v-if="jobApplication.location"
        class="flex items-center text-xs text-gray-600 dark:text-gray-300"
      >
        <UIcon name="i-lucide-map-pin" class="w-3 h-3 mr-1 flex-shrink-0" />
        <span class="truncate">{{ jobApplication.location }}</span>
      </div>

      <div
        v-if="jobApplication.salaryRange"
        class="flex items-center text-xs text-gray-600 dark:text-gray-300"
      >
        <UIcon name="i-lucide-credit-card" class="w-3 h-3 mr-1 flex-shrink-0" />
        <span class="truncate">{{ jobApplication.salaryRange }}</span>
      </div>

      <div
        v-if="jobApplication.source"
        class="flex items-center text-xs text-gray-600 dark:text-gray-300"
      >
        <UIcon name="i-lucide-link" class="w-3 h-3 mr-1 flex-shrink-0" />
        <span class="truncate">{{ jobApplication.source }}</span>
      </div>
    </div>

    <!-- Tags -->
    <div
      v-if="jobApplication.tags.length > 0"
      class="flex flex-wrap gap-1 mb-3"
    >
      <UBadge
        v-for="tag in jobApplication.tags.slice(0, 3)"
        :key="tag"
        color="primary"
        variant="soft"
        size="sm"
      >
        {{ tag }}
      </UBadge>
      <UBadge
        v-if="jobApplication.tags.length > 3"
        color="neutral"
        variant="soft"
        size="md"
      >
        +{{ jobApplication.tags.length - 3 }}
      </UBadge>
    </div>

    <!-- Footer with Date and Days in Stage -->
    <div
      class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700"
    >
      <div
        class="flex items-center"
        :title="`Applied on ${formattedApplicationDate}`"
      >
        <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
        <span>{{ currentStageDate }}</span>
      </div>
      <div class="flex items-center">
        <UIcon name="i-lucide-clock" class="w-3 h-3 mr-1" />
        <span>{{ daysInStage }} {{ daysInStage === 1 ? 'day' : 'days' }}</span>
      </div>
    </div>
  </UCard>
</template>
