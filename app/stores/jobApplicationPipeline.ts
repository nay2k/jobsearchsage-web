import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type {
  JobApplication,
  PipelineStage,
  JobApplicationPipelineState,
} from '~/types/job-tracker';
import { PIPELINE_STAGES } from '~/types/job-tracker';

export const useJobApplicationPipelineStore = defineStore(
  'jobApplicationPipeline',
  () => {
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

    // Actions (placeholder for future implementation)
    function setSearchQuery(query: string) {
      searchQuery.value = query;
    }

    function selectJobApplication(jobApplicationId: string | null) {
      selectedJobApplicationId.value = jobApplicationId;
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
      setSearchQuery,
      selectJobApplication,
    };
  }
);
