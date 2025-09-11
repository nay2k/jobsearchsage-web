import type { Communication } from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'id');
    const body = await readBody<Omit<Communication, 'id' | 'timestamp'>>(event);

    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job application ID is required',
      });
    }

    // Validate required fields
    if (!body.content?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Communication content is required',
      });
    }

    if (
      !body.type ||
      !['email', 'phone', 'meeting', 'message'].includes(body.type)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid communication type is required',
      });
    }

    if (!body.direction || !['inbound', 'outbound'].includes(body.direction)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid communication direction is required',
      });
    }

    // Check if job application exists
    const existingJobApplication = await MockDatabase.getJobApplicationById(
      jobId
    );
    if (!existingJobApplication) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job application not found',
      });
    }

    // Create the new communication
    const newCommunication: Communication = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: body.type,
      direction: body.direction,
      subject: body.subject?.trim() || undefined,
      content: body.content.trim(),
      contactPerson: body.contactPerson?.trim() || undefined,
      timestamp: new Date(),
    };

    // Add communication to database
    await MockDatabase.addCommunication(jobId, newCommunication);

    return newCommunication;
  } catch (error: any) {
    // Re-throw known errors
    if (error.statusCode) {
      throw error;
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add communication',
    });
  }
});
