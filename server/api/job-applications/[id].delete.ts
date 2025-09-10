import type { JobApplication } from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'id');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job application ID is required',
      });
    }

    // Delete the job application using mock database
    const deletedJobApplication = await MockDatabase.deleteJobApplication(
      jobId
    );

    if (!deletedJobApplication) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job application not found',
      });
    }

    // Return success response with deleted job application data
    return {
      success: true,
      message: 'Job application deleted successfully',
      deletedJobApplication,
    };
  } catch (error: any) {
    // Re-throw known errors
    if (error.statusCode) {
      throw error;
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete job application',
    });
  }
});
