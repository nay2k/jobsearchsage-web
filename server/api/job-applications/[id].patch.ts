import type {
  JobApplication,
  UpdateJobApplicationRequest,
  PipelineStage,
} from '#shared/types/job-tracker';
import { PIPELINE_STAGES } from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'id');
    const body = await readBody<UpdateJobApplicationRequest>(event);

    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job application ID is required',
      });
    }

    // Get existing job application
    const existingJobApplication = await MockDatabase.getJobApplicationById(
      jobId
    );

    if (!existingJobApplication) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job application not found',
      });
    }

    // Validate stage if provided
    if (body.stage && !PIPELINE_STAGES.includes(body.stage)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid stage. Must be one of: ${PIPELINE_STAGES.join(
          ', '
        )}`,
      });
    }

    // Validate priority if provided
    if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid priority. Must be one of: low, medium, high',
      });
    }

    // Validate required fields if they're being updated
    if (body.title !== undefined && !body.title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title cannot be empty',
      });
    }

    if (body.company !== undefined && !body.company.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company cannot be empty',
      });
    }

    // Create updated job application
    const updatedJobApplication: JobApplication = {
      ...existingJobApplication,
      ...body,
      // Handle date conversion if applicationDeadline is provided
      applicationDeadline: body.applicationDeadline
        ? new Date(body.applicationDeadline)
        : existingJobApplication.applicationDeadline,
    };

    // Handle stage change - add to stage history if stage is being updated
    if (body.stage && body.stage !== existingJobApplication.stage) {
      const stageTransition = {
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        fromStage: existingJobApplication.stage,
        toStage: body.stage,
        timestamp: new Date(),
        notes: `Stage updated via API`,
      };

      updatedJobApplication.stageHistory = [
        ...existingJobApplication.stageHistory,
        stageTransition,
      ];
    }

    // Update using mock database
    const result = await MockDatabase.updateJobApplication(
      jobId,
      updatedJobApplication
    );

    if (!result) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update job application',
      });
    }

    return result;
  } catch (error: any) {
    // Re-throw known errors
    if (error.statusCode) {
      throw error;
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update job application',
    });
  }
});
