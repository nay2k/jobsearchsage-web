import { useJobApplicationStore } from '~/stores/useJobApplicationStore';
import type { JobApplication, PipelineStage } from '#shared/types/job-tracker';

/**
 * Composable for managing job application updates via drag and drop
 * Provides API integration for moving job applications between pipeline stages
 */
export const useJobApplicationDragAndDrop = () => {
  const jobApplicationStore = useJobApplicationStore();

  /**
   * Moves a job application to a new pipeline stage
   * @param jobApplication - The job application to move
   * @param targetStage - The target pipeline stage
   * @returns Promise that resolves when the move operation is complete
   */
  const moveJobApplication = async (
    jobApplication: JobApplication,
    targetStage: PipelineStage
  ): Promise<void> => {
    // Don't update if dropping on the same stage
    if (jobApplication.stage === targetStage) {
      console.log('Job application already in target stage, no update needed');
      return;
    }

    console.log(
      `Moving "${jobApplication.title}" from ${jobApplication.stage} to ${targetStage}`
    );

    try {
      // Clear any previous errors when starting a new operation
      jobApplicationStore.clearError();

      // Update the job application stage through the store
      await jobApplicationStore.updateJobApplicationStage(
        jobApplication.id,
        targetStage
      );

      console.log(
        `Successfully moved job application "${jobApplication.title}" to ${targetStage}`
      );
    } catch (error) {
      console.error(
        'Failed to update job application stage during drag and drop:',
        error
      );
      // Error handling is managed by the store (optimistic updates are reverted)
      throw error;
    }
  };

  return {
    moveJobApplication,
  };
};
