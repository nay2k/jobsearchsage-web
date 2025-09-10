import type {
  JobApplication,
  CreateJobApplicationRequest,
  PipelineStage,
} from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    const body = await readBody<CreateJobApplicationRequest>(event);

    // Validate required fields
    if (!body.title || !body.company) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and company are required fields',
      });
    }

    // Generate unique ID (in production, this would be handled by the database)
    const id = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create the new job application
    const newJobApplication: JobApplication = {
      id,
      title: body.title,
      company: body.company,
      location: body.location,
      url: body.url,
      description: body.description,
      salaryRange: body.salaryRange,
      applicationDeadline: body.applicationDeadline
        ? new Date(body.applicationDeadline)
        : undefined,
      stage: 'researched' as PipelineStage, // All new applications start in 'researched' stage
      dateAdded: new Date(),
      stageHistory: [
        {
          id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          fromStage: null,
          toStage: 'researched' as PipelineStage,
          timestamp: new Date(),
          notes: 'Job application created',
        },
      ],
      notes: [],
      communications: [],
      tags: body.tags || [],
      priority: body.priority || 'medium',
      source: body.source || 'Manual Entry',
    };

    // Save to mock database
    const savedJobApplication = await MockDatabase.createJobApplication(
      newJobApplication
    );

    return savedJobApplication;
  } catch (error: any) {
    // Handle validation errors
    if (error.statusCode === 400) {
      throw error;
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create job application',
    });
  }
});
