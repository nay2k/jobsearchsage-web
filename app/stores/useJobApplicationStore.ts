import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { JobApplication, PipelineStage } from '#shared/types/job-tracker';
import { PIPELINE_STAGES } from '#shared/types/job-tracker';

export const useJobApplicationStore = defineStore('jobApplication', () => {
  // State
  const jobApplications = ref<JobApplication[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const selectedJobApplicationId = ref<string | null>(null);

  // Getters
  const jobApplicationsByStage = computed(() => {
    const filtered = jobApplications.value.filter(
      (jobApplication) =>
        jobApplication.title
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        jobApplication.company
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
    );

    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = filtered.filter(
        (jobApplication) => jobApplication.stage === stage
      );
      return acc;
    }, {} as Record<PipelineStage, JobApplication[]>);
  });

  const selectedJobApplication = computed(() =>
    selectedJobApplicationId.value
      ? jobApplications.value.find(
          (jobApplication) =>
            jobApplication.id === selectedJobApplicationId.value
        )
      : null
  );

  const jobApplicationCount = computed(() => jobApplications.value.length);

  // Actions
  async function fetchJobApplications() {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ data: JobApplication[]; total: number }>(
        '/api/job-applications'
      );
      jobApplications.value = response.data;
    } catch (err) {
      error.value = 'Failed to fetch job applications';
      console.error('Error fetching job applications:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createJobApplication(
    jobApplicationData: Omit<
      JobApplication,
      'id' | 'dateAdded' | 'stageHistory'
    >
  ) {
    try {
      const newJobApplication = await $fetch<JobApplication>(
        '/api/job-applications',
        {
          method: 'POST',
          body: jobApplicationData,
        }
      );
      jobApplications.value.push(newJobApplication);
      return newJobApplication;
    } catch (err) {
      error.value = 'Failed to create job application';
      console.error('Error creating job application:', err);
      throw err;
    }
  }

  async function updateJobApplication(
    jobApplicationId: string,
    updates: Partial<JobApplication>
  ) {
    try {
      const updatedJobApplication = await $fetch<JobApplication>(
        `/api/job-applications/${jobApplicationId}`,
        {
          method: 'PATCH',
          body: updates,
        }
      );

      const jobApplicationIndex = jobApplications.value.findIndex(
        (jobApplication) => jobApplication.id === jobApplicationId
      );

      if (jobApplicationIndex !== -1) {
        jobApplications.value[jobApplicationIndex] = updatedJobApplication;
      }

      return updatedJobApplication;
    } catch (err) {
      error.value = 'Failed to update job application';
      console.error('Error updating job application:', err);
      throw err;
    }
  }

  async function updateJobApplicationStage(
    jobApplicationId: string,
    newStage: PipelineStage
  ) {
    const jobApplicationIndex = jobApplications.value.findIndex(
      (jobApplication) => jobApplication.id === jobApplicationId
    );

    if (jobApplicationIndex === -1) {
      throw new Error('Job application not found');
    }

    // Store original state for rollback
    const originalJobApplication = jobApplications.value[jobApplicationIndex];

    if (!originalJobApplication) {
      throw new Error('Job application not found');
    }

    // Optimistic update - create new object with updated stage
    const optimisticUpdate: JobApplication = {
      ...originalJobApplication,
      stage: newStage,
    };

    jobApplications.value[jobApplicationIndex] = optimisticUpdate;

    try {
      const updatedJobApplication = await $fetch<JobApplication>(
        `/api/job-applications/${jobApplicationId}`,
        {
          method: 'PATCH',
          body: { stage: newStage },
        }
      );

      // Update with server response
      jobApplications.value[jobApplicationIndex] = updatedJobApplication;
      return updatedJobApplication;
    } catch (err) {
      // Rollback optimistic update on error
      jobApplications.value[jobApplicationIndex] = originalJobApplication;
      error.value = 'Failed to update job application stage';
      console.error('Error updating job application stage:', err);
      throw err;
    }
  }

  async function deleteJobApplication(jobApplicationId: string) {
    try {
      await $fetch(`/api/job-applications/${jobApplicationId}`, {
        method: 'DELETE',
      } as any);

      jobApplications.value = jobApplications.value.filter(
        (jobApplication) => jobApplication.id !== jobApplicationId
      );

      // Clear selection if deleted job was selected
      if (selectedJobApplicationId.value === jobApplicationId) {
        selectedJobApplicationId.value = null;
      }
    } catch (err) {
      error.value = 'Failed to delete job application';
      console.error('Error deleting job application:', err);
      throw err;
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function selectJobApplication(jobApplicationId: string | null) {
    selectedJobApplicationId.value = jobApplicationId;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State (readonly to prevent direct mutation)
    jobApplications: readonly(jobApplications),
    loading: readonly(loading),
    error: readonly(error),
    searchQuery: readonly(searchQuery),
    selectedJobApplicationId: readonly(selectedJobApplicationId),

    // Getters
    jobApplicationsByStage,
    selectedJobApplication,
    jobApplicationCount,

    // Actions
    fetchJobApplications,
    createJobApplication,
    updateJobApplication,
    updateJobApplicationStage,
    deleteJobApplication,
    setSearchQuery,
    selectJobApplication,
    clearError,
  };
});
