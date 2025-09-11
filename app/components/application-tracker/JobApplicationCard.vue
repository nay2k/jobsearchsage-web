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

// Enhanced priority styling with icons and colors
const priorityConfig = computed(() => {
  switch (props.jobApplication.priority) {
    case 'high':
      return {
        color: 'error' as const,
        icon: 'i-lucide-arrow-up',
        label: 'High Priority',
        variant: 'soft' as const,
      };
    case 'medium':
      return {
        color: 'warning' as const,
        icon: 'i-lucide-minus',
        label: 'Medium Priority',
        variant: 'soft' as const,
      };
    case 'low':
      return {
        color: 'neutral' as const,
        icon: 'i-lucide-arrow-down',
        label: 'Low Priority',
        variant: 'soft' as const,
      };
    default:
      return {
        color: 'neutral' as const,
        icon: 'i-lucide-minus',
        label: 'Medium Priority',
        variant: 'soft' as const,
      };
  }
});

// Stage status indicators with colors and icons
const stageConfig = computed(() => {
  switch (props.jobApplication.stage) {
    case 'researched':
      return {
        color: 'info' as const,
        icon: 'i-lucide-search',
        label: 'Researched',
      };
    case 'applied':
      return {
        color: 'primary' as const,
        icon: 'i-lucide-send',
        label: 'Applied',
      };
    case 'phone_screen':
      return {
        color: 'warning' as const,
        icon: 'i-lucide-phone',
        label: 'Phone Screen',
      };
    case 'interview':
      return {
        color: 'info' as const,
        icon: 'i-lucide-users',
        label: 'Interview',
      };
    case 'final':
      return {
        color: 'secondary' as const,
        icon: 'i-lucide-star',
        label: 'Final Round',
      };
    case 'offer':
      return {
        color: 'success' as const,
        icon: 'i-lucide-check',
        label: 'Offer',
      };
    case 'rejected':
      return {
        color: 'error' as const,
        icon: 'i-lucide-x',
        label: 'Rejected',
      };
    case 'withdrawn':
      return {
        color: 'neutral' as const,
        icon: 'i-lucide-arrow-left',
        label: 'Withdrawn',
      };
    default:
      return {
        color: 'neutral' as const,
        icon: 'i-lucide-circle',
        label: 'Unknown',
      };
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
    return {
      text: 'Deadline passed',
      color: 'error' as const,
      icon: 'i-lucide-alert-triangle',
      urgent: true,
    };
  } else if (daysUntilDeadline <= 3) {
    return {
      text: `${daysUntilDeadline} days left`,
      color: 'warning' as const,
      icon: 'i-lucide-clock',
      urgent: true,
    };
  } else if (daysUntilDeadline <= 7) {
    return {
      text: `${daysUntilDeadline} days left`,
      color: 'info' as const,
      icon: 'i-lucide-clock',
      urgent: false,
    };
  }

  return null;
});

// Days in stage urgency indicator
const stageUrgency = computed(() => {
  const days = daysInStage.value;
  if (days > 14) {
    return { color: 'error' as const, urgent: true };
  } else if (days > 7) {
    return { color: 'warning' as const, urgent: false };
  }
  return { color: 'neutral' as const, urgent: false };
});

// Check if there are recent communications or notes
const hasRecentActivity = computed(() => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const recentNotes = props.jobApplication.notes.some(
    (note) => new Date(note.timestamp) > threeDaysAgo
  );

  const recentCommunications = props.jobApplication.communications.some(
    (comm) => new Date(comm.timestamp) > threeDaysAgo
  );

  return recentNotes || recentCommunications;
});

// Handle card click to open slideover
const { openJobApplicationSlideover } = useJobApplicationTracker();

function handleCardClick() {
  openJobApplicationSlideover(props.jobApplication.id);
}
</script>

<template>
  <UCard
    class="group cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-transparent bg-white dark:bg-gray-900 relative"
    :class="{
      'ring-2 ring-red-200 dark:ring-red-800 border-red-300 dark:border-red-700':
        deadlineWarning?.urgent,
      'ring-1 ring-blue-200 dark:ring-blue-800': hasRecentActivity,
      'hover:ring-2 hover:ring-green-200 dark:hover:ring-green-800': true,
    }"
    @click="handleCardClick"
  >
    <!-- Card Content with improved spacing -->
    <div class="p-2">
      <!-- Card Header with Company and Title (Full Width) -->
      <div class="mb-2">
        <div class="flex items-center">
          <h3
            class="text-base font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors"
          >
            {{ jobApplication.company }}
          </h3>
          <UIcon
            v-if="hasRecentActivity"
            name="i-lucide-activity"
            class="w-4 h-4 text-blue-500 flex-shrink-0"
            title="Recent activity"
          />
        </div>
        <p
          class="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed"
        >
          {{ jobApplication.title }}
        </p>
      </div>

      <!-- Priority and Status Badges Row -->
      <div class="flex items-center gap-2 mb-3 flex-wrap">
        <!-- Priority Badge (simplified) -->
        <UBadge
          :color="priorityConfig.color"
          :variant="priorityConfig.variant"
          size="sm"
        >
          {{ jobApplication.priority }}
        </UBadge>

        <!-- Deadline Warning (if urgent) -->
        <UBadge
          v-if="deadlineWarning?.urgent"
          :color="deadlineWarning.color"
          variant="solid"
          size="sm"
          class="animate-pulse"
        >
          {{ deadlineWarning.text }}
        </UBadge>

        <!-- Days in Stage (if urgent) -->
        <UBadge
          v-if="stageUrgency.urgent"
          :color="stageUrgency.color"
          variant="soft"
          size="sm"
        >
          {{ daysInStage }}d in stage
        </UBadge>
      </div>

      <!-- Job Details Section -->
      <div class="space-y-1.5 mb-3">
        <!-- Location -->
        <div
          v-if="jobApplication.location"
          class="flex items-center text-sm text-gray-600 dark:text-gray-300"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
          />
          <span class="truncate">{{ jobApplication.location }}</span>
        </div>

        <!-- Salary Range -->
        <div
          v-if="jobApplication.salaryRange"
          class="flex items-center text-sm text-gray-600 dark:text-gray-300"
        >
          <UIcon
            name="i-lucide-credit-card"
            class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
          />
          <span
            class="truncate font-semibold text-green-600 dark:text-green-400"
            >{{ jobApplication.salaryRange }}</span
          >
        </div>

        <!-- Source -->
        <div
          v-if="jobApplication.source"
          class="flex items-center text-sm text-gray-600 dark:text-gray-300"
        >
          <UIcon
            name="i-lucide-link"
            class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
          />
          <span class="truncate">{{ jobApplication.source }}</span>
        </div>
      </div>

      <!-- Tags Section -->
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
          class="font-medium"
        >
          {{ tag }}
        </UBadge>
        <UBadge
          v-if="jobApplication.tags.length > 3"
          color="neutral"
          variant="soft"
          size="sm"
        >
          +{{ jobApplication.tags.length - 3 }}
        </UBadge>
      </div>

      <!-- Footer with Enhanced Metrics -->
      <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm">
          <!-- Application Date -->
          <div
            class="flex items-center text-gray-500 dark:text-gray-400"
            :title="`Applied on ${formattedApplicationDate}`"
          >
            <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1.5" />
            <span>{{ currentStageDate }}</span>
          </div>

          <!-- Days in Stage with Urgency Indicator -->
          <div
            class="flex items-center font-semibold"
            :class="{
              'text-red-600 dark:text-red-400':
                stageUrgency.urgent && stageUrgency.color === 'error',
              'text-orange-600 dark:text-orange-400':
                !stageUrgency.urgent && stageUrgency.color === 'warning',
              'text-gray-500 dark:text-gray-400':
                stageUrgency.color === 'neutral',
            }"
          >
            <UIcon
              name="i-lucide-clock"
              class="w-4 h-4 mr-1.5"
              :class="{
                'animate-pulse': stageUrgency.urgent,
              }"
            />
            <span>{{ daysInStage }}d</span>
          </div>
        </div>

        <!-- Activity Indicators -->
        <div
          v-if="
            jobApplication.notes.length > 0 ||
            jobApplication.communications.length > 0
          "
          class="flex items-center gap-4 mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400"
        >
          <div v-if="jobApplication.notes.length > 0" class="flex items-center">
            <UIcon name="i-lucide-sticky-note" class="w-3 h-3 mr-1" />
            <span>{{ jobApplication.notes.length }}</span>
          </div>
          <div
            v-if="jobApplication.communications.length > 0"
            class="flex items-center"
          >
            <UIcon name="i-lucide-message-circle" class="w-3 h-3 mr-1" />
            <span>{{ jobApplication.communications.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hover Overlay for Visual Feedback -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"
    />
  </UCard>
</template>
