import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type {
  JobApplication,
  StageTransition,
  Note,
  Communication,
} from '../types/job-tracker';

const DB_PATH = join(process.cwd(), 'shared/mock/db');

// Database table interfaces
interface DatabaseTables {
  jobApplications: JobApplication[];
  stageTransitions: (StageTransition & { jobApplicationId: string })[];
  notes: (Note & { jobApplicationId: string })[];
  communications: (Communication & { jobApplicationId: string })[];
}

// Generic database operations
export class MockDatabase {
  private static async readTable<T>(
    tableName: keyof DatabaseTables
  ): Promise<T[]> {
    try {
      const filePath = join(
        DB_PATH,
        `${tableName.replace(/([A-Z])/g, '-$1').toLowerCase()}.json`
      );
      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${tableName}:`, error);
      return [];
    }
  }

  private static async writeTable<T>(
    tableName: keyof DatabaseTables,
    data: T[]
  ): Promise<void> {
    try {
      const filePath = join(
        DB_PATH,
        `${tableName.replace(/([A-Z])/g, '-$1').toLowerCase()}.json`
      );
      await writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${tableName}:`, error);
      throw error;
    }
  }

  // Job Applications operations
  static async getJobApplications(): Promise<JobApplication[]> {
    const [jobApplications, stageTransitions, notes, communications] =
      await Promise.all([
        this.readTable<JobApplication>('jobApplications'),
        this.readTable<StageTransition & { jobApplicationId: string }>(
          'stageTransitions'
        ),
        this.readTable<Note & { jobApplicationId: string }>('notes'),
        this.readTable<Communication & { jobApplicationId: string }>(
          'communications'
        ),
      ]);

    // Combine related data
    return jobApplications.map((app) => ({
      ...app,
      dateAdded: new Date(app.dateAdded),
      applicationDeadline: app.applicationDeadline
        ? new Date(app.applicationDeadline)
        : undefined,
      stageHistory: stageTransitions
        .filter((st) => st.jobApplicationId === app.id)
        .map((st) => ({
          id: st.id,
          fromStage: st.fromStage,
          toStage: st.toStage,
          timestamp: new Date(st.timestamp),
          notes: st.notes,
        })),
      notes: notes
        .filter((note) => note.jobApplicationId === app.id)
        .map((note) => ({
          id: note.id,
          content: note.content,
          timestamp: new Date(note.timestamp),
          type: note.type,
        })),
      communications: communications
        .filter((comm) => comm.jobApplicationId === app.id)
        .map((comm) => ({
          id: comm.id,
          type: comm.type,
          direction: comm.direction,
          subject: comm.subject,
          content: comm.content,
          timestamp: new Date(comm.timestamp),
          contactPerson: comm.contactPerson,
        })),
    }));
  }

  static async getJobApplicationById(
    id: string
  ): Promise<JobApplication | null> {
    const jobApplications = await this.getJobApplications();
    return jobApplications.find((app) => app.id === id) || null;
  }

  static async createJobApplication(
    jobApplication: JobApplication
  ): Promise<JobApplication> {
    const jobApplications = await this.readTable<JobApplication>(
      'jobApplications'
    );

    // Add the new job application (without related data)
    const newJobApp = {
      ...jobApplication,
      dateAdded: jobApplication.dateAdded.toISOString(),
      applicationDeadline: jobApplication.applicationDeadline?.toISOString(),
    };

    jobApplications.push(newJobApp as any);
    await this.writeTable('jobApplications', jobApplications);

    // Add stage history
    if (jobApplication.stageHistory.length > 0) {
      const stageTransitions = await this.readTable<
        StageTransition & { jobApplicationId: string }
      >('stageTransitions');
      const newTransitions = jobApplication.stageHistory.map((st) => ({
        ...st,
        jobApplicationId: jobApplication.id,
        timestamp: st.timestamp.toISOString(),
      }));
      stageTransitions.push(...(newTransitions as any));
      await this.writeTable('stageTransitions', stageTransitions);
    }

    return jobApplication;
  }

  static async updateJobApplication(
    id: string,
    updates: Partial<JobApplication>
  ): Promise<JobApplication | null> {
    const jobApplications = await this.readTable<JobApplication>(
      'jobApplications'
    );
    const index = jobApplications.findIndex((app) => app.id === id);

    if (index === -1) {
      return null;
    }

    // Update the job application
    const updatedApp = {
      ...jobApplications[index],
      ...updates,
      dateAdded:
        updates.dateAdded?.toISOString() || jobApplications[index]?.dateAdded,
      applicationDeadline:
        updates.applicationDeadline?.toISOString() ||
        jobApplications[index]?.applicationDeadline,
    };

    jobApplications[index] = updatedApp as any;
    await this.writeTable('jobApplications', jobApplications);

    // Handle stage history updates
    if (updates.stageHistory) {
      const stageTransitions = await this.readTable<
        StageTransition & { jobApplicationId: string }
      >('stageTransitions');

      // Remove existing transitions for this job
      const filteredTransitions = stageTransitions.filter(
        (st) => st.jobApplicationId !== id
      );

      // Add new transitions
      const newTransitions = updates.stageHistory.map((st) => ({
        ...st,
        jobApplicationId: id,
        timestamp: st.timestamp.toISOString(),
      }));

      filteredTransitions.push(...(newTransitions as any));
      await this.writeTable('stageTransitions', filteredTransitions);
    }

    return this.getJobApplicationById(id);
  }

  static async deleteJobApplication(
    id: string
  ): Promise<JobApplication | null> {
    const jobApplication = await this.getJobApplicationById(id);

    if (!jobApplication) {
      return null;
    }

    // Delete from all tables
    const [jobApplications, stageTransitions, notes, communications] =
      await Promise.all([
        this.readTable<JobApplication>('jobApplications'),
        this.readTable<StageTransition & { jobApplicationId: string }>(
          'stageTransitions'
        ),
        this.readTable<Note & { jobApplicationId: string }>('notes'),
        this.readTable<Communication & { jobApplicationId: string }>(
          'communications'
        ),
      ]);

    // Filter out the deleted job application and related data
    const filteredJobApplications = jobApplications.filter(
      (app) => app.id !== id
    );
    const filteredStageTransitions = stageTransitions.filter(
      (st) => st.jobApplicationId !== id
    );
    const filteredNotes = notes.filter((note) => note.jobApplicationId !== id);
    const filteredCommunications = communications.filter(
      (comm) => comm.jobApplicationId !== id
    );

    // Write back to files
    await Promise.all([
      this.writeTable('jobApplications', filteredJobApplications),
      this.writeTable('stageTransitions', filteredStageTransitions),
      this.writeTable('notes', filteredNotes),
      this.writeTable('communications', filteredCommunications),
    ]);

    return jobApplication;
  }

  // Helper method to add a stage transition
  static async addStageTransition(
    jobApplicationId: string,
    transition: StageTransition
  ): Promise<void> {
    const stageTransitions = await this.readTable<
      StageTransition & { jobApplicationId: string }
    >('stageTransitions');

    const newTransition = {
      ...transition,
      jobApplicationId,
      timestamp: transition.timestamp.toISOString(),
    };

    stageTransitions.push(newTransition as any);
    await this.writeTable('stageTransitions', stageTransitions);
  }
}
