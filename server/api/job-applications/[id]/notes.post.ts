import type { Note } from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'id');
    const body = await readBody<Omit<Note, 'id' | 'timestamp'>>(event);

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
        statusMessage: 'Note content is required',
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

    // Create the new note
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: body.content.trim(),
      type: body.type || 'general',
      timestamp: new Date(),
    };

    // Add note to database
    await MockDatabase.addNote(jobId, newNote);

    return newNote;
  } catch (error: any) {
    // Re-throw known errors
    if (error.statusCode) {
      throw error;
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add note',
    });
  }
});
