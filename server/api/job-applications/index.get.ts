import type { JobApplication } from '#shared/types/job-tracker';
import { MockDatabase } from '#shared/mock/db-utils';

export default eventHandler(async (event) => {
  try {
    // In a real application, you would:
    // 1. Get user ID from authentication
    // 2. Query database for user's job applications
    // 3. Apply any filtering/pagination from query params

    const query = getQuery(event);
    let filteredApplications = await MockDatabase.getJobApplications();

    // Apply search filter if provided
    if (query.search && typeof query.search === 'string') {
      const searchTerm = query.search.toLowerCase();
      filteredApplications = filteredApplications.filter(
        (app) =>
          app.title.toLowerCase().includes(searchTerm) ||
          app.company.toLowerCase().includes(searchTerm) ||
          app.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply stage filter if provided
    if (query.stage && typeof query.stage === 'string') {
      filteredApplications = filteredApplications.filter(
        (app) => app.stage === query.stage
      );
    }

    // Apply pagination if provided
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedApplications = filteredApplications.slice(
      startIndex,
      endIndex
    );

    return {
      data: paginatedApplications,
      total: filteredApplications.length,
      page,
      limit,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch job applications',
    });
  }
});
