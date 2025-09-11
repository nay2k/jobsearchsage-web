<script setup lang="ts">
// Set page metadata
definePageMeta({
  title: 'Application Tracker',
  description: 'Track and manage your job applications through the pipeline',
});

// Set page title for SEO and browser tab
useSeoMeta({
  title: 'Application Tracker - JobSearchSage',
  description:
    'Manage your job applications with our Kanban-style pipeline tracker',
});

// Get slideover state for layout adjustment
const {
  isJobApplicationSlideoverOpen,
  closeJobApplicationSlideover,
  openNewJobApplicationSlideover,
} = useJobApplicationTracker();

// Initialize the job application store
const jobApplicationStore = useJobApplicationStore();

// Load data on page mount
onMounted(async () => {
  try {
    await jobApplicationStore.fetchJobApplications();
  } catch (error) {
    console.error('Failed to load job applications:', error);
  }
});

// Handle creating a new job application
function handleCreateJobApplication() {
  openNewJobApplicationSlideover();
}
</script>

<template>
  <UDashboardPanel id="application-tracker">
    <template #header>
      <UDashboardNavbar title="Job Application Tracker">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="md"
            icon="i-lucide-plus"
            label="Add Job Application"
            @click="handleCreateJobApplication"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full overflow-hidden -mx-4 -my-4">
        <!-- Main content area - Kanban Board -->
        <div
          class="transition-all duration-300 ease-in-out flex-shrink-0"
          :class="{
            'w-full p-4': !isJobApplicationSlideoverOpen,
            'w-[70%] pl-4 pr-0 py-4': isJobApplicationSlideoverOpen,
          }"
        >
          <!-- Kanban Board -->
          <ApplicationTrackerKanbanBoard />
        </div>

        <!-- Job Application Detail Panel -->
        <div
          v-if="isJobApplicationSlideoverOpen"
          class="w-[30%] min-w-[400px] transition-all duration-300 ease-in-out border-l border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0"
        >
          <ApplicationTrackerJobApplicationDetailPanel />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
