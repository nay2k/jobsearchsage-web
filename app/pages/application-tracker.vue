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
      <!-- Kanban Board -->
      <ApplicationTrackerKanbanBoard />
    </template>
  </UDashboardPanel>
</template>
