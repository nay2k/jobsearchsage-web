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
const { isJobApplicationSlideoverOpen, closeJobApplicationSlideover } =
  useJobApplicationTracker();
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
            class="cursor-pointer"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full">
        <!-- Main content area -->
        <div
          class="flex-1 transition-all duration-300 ease-in-out"
          :class="{
            'mr-[30%]': isJobApplicationSlideoverOpen,
            'mr-0': !isJobApplicationSlideoverOpen,
          }"
        >
          <!-- Kanban Board -->
          <ApplicationTrackerKanbanBoard />
        </div>

        <!-- Job Application Detail Slideover -->
        <ApplicationTrackerJobApplicationDetailSlideover />
      </div>
    </template>
  </UDashboardPanel>
</template>
