import { db } from "./db";
import {
  User,
  Dataset,
  MigrationJob,
  MigrationStep,
  DatasetFile,
  AnalysisReport,
  InsertUser,
  InsertDataset,
  InsertMigrationJob,
  InsertMigrationStep,
  InsertDatasetFile,
  InsertAnalysisReport,
} from "@shared/schema";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  constructor() {
    console.log("PostgreSQL storage initialized");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.execute(
      db.sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
    );
    return users.length > 0 ? (users[0] as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.execute(
      db.sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`
    );
    return users.length > 0 ? (users[0] as User) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.execute(
      db.sql`
        INSERT INTO users (username, email, display_name) 
        VALUES (${user.username}, ${user.email}, ${user.displayName}) 
        RETURNING *
      `
    );
    return result[0] as User;
  }

  // Dataset methods
  async getDatasets(): Promise<Dataset[]> {
    const datasets = await db.execute(db.sql`SELECT * FROM datasets ORDER BY created_at DESC`);
    return datasets as Dataset[];
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const datasets = await db.execute(
      db.sql`SELECT * FROM datasets WHERE id = ${id} LIMIT 1`
    );
    return datasets.length > 0 ? (datasets[0] as Dataset) : undefined;
  }

  async getDatasetByName(name: string): Promise<Dataset | undefined> {
    const datasets = await db.execute(
      db.sql`SELECT * FROM datasets WHERE name = ${name} LIMIT 1`
    );
    return datasets.length > 0 ? (datasets[0] as Dataset) : undefined;
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const result = await db.execute(
      db.sql`
        INSERT INTO datasets (
          name, 
          description, 
          original_platform, 
          original_url, 
          current_platform, 
          metadata, 
          files_count, 
          total_size
        ) VALUES (
          ${dataset.name}, 
          ${dataset.description}, 
          ${dataset.originalPlatform}, 
          ${dataset.originalUrl}, 
          ${dataset.currentPlatform}, 
          ${JSON.stringify(dataset.metadata || {})}, 
          ${dataset.filesCount}, 
          ${dataset.totalSize}
        ) RETURNING *
      `
    );
    return result[0] as Dataset;
  }

  async updateDataset(
    id: number,
    dataset: Partial<Dataset>
  ): Promise<Dataset | undefined> {
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    
    if (dataset.name !== undefined) {
      setClauses.push('name = $' + (values.length + 1));
      values.push(dataset.name);
    }
    
    if (dataset.description !== undefined) {
      setClauses.push('description = $' + (values.length + 1));
      values.push(dataset.description);
    }
    
    if (dataset.currentPlatform !== undefined) {
      setClauses.push('current_platform = $' + (values.length + 1));
      values.push(dataset.currentPlatform);
    }
    
    if (dataset.metadata !== undefined) {
      setClauses.push('metadata = $' + (values.length + 1));
      values.push(JSON.stringify(dataset.metadata));
    }
    
    if (dataset.filesCount !== undefined) {
      setClauses.push('files_count = $' + (values.length + 1));
      values.push(dataset.filesCount);
    }
    
    if (dataset.totalSize !== undefined) {
      setClauses.push('total_size = $' + (values.length + 1));
      values.push(dataset.totalSize);
    }
    
    // Add updated_at
    setClauses.push('updated_at = NOW()');
    
    if (setClauses.length === 0) {
      return this.getDataset(id);
    }
    
    // Build and execute query
    const query = `
      UPDATE datasets 
      SET ${setClauses.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await db.execute(query, values);
    return result.length > 0 ? (result[0] as Dataset) : undefined;
  }

  async deleteDataset(id: number): Promise<boolean> {
    const result = await db.execute(
      db.sql`DELETE FROM datasets WHERE id = ${id} RETURNING id`
    );
    return result.length > 0;
  }

  // Migration job methods
  async getMigrationJobs(): Promise<MigrationJob[]> {
    const jobs = await db.execute(
      db.sql`SELECT * FROM migration_jobs ORDER BY created_at DESC`
    );
    return jobs as MigrationJob[];
  }

  async getMigrationJob(id: number): Promise<MigrationJob | undefined> {
    const jobs = await db.execute(
      db.sql`SELECT * FROM migration_jobs WHERE id = ${id} LIMIT 1`
    );
    return jobs.length > 0 ? (jobs[0] as MigrationJob) : undefined;
  }

  async getMigrationJobsByDatasetId(datasetId: number): Promise<MigrationJob[]> {
    const jobs = await db.execute(
      db.sql`
        SELECT * FROM migration_jobs 
        WHERE dataset_id = ${datasetId} 
        ORDER BY created_at DESC
      `
    );
    return jobs as MigrationJob[];
  }

  async getRecentMigrationJobs(limit: number): Promise<MigrationJob[]> {
    const jobs = await db.execute(
      db.sql`
        SELECT * FROM migration_jobs 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `
    );
    return jobs as MigrationJob[];
  }

  async createMigrationJob(job: InsertMigrationJob): Promise<MigrationJob> {
    const result = await db.execute(
      db.sql`
        INSERT INTO migration_jobs (
          dataset_id, 
          source_platform, 
          source_url, 
          destination_platform, 
          status, 
          progress, 
          options
        ) VALUES (
          ${job.datasetId}, 
          ${job.sourcePlatform}, 
          ${job.sourceUrl}, 
          ${job.destinationPlatform}, 
          ${job.status}, 
          ${job.progress || 0}, 
          ${JSON.stringify(job.options || {})}
        ) RETURNING *
      `
    );
    return result[0] as MigrationJob;
  }

  async updateMigrationJob(
    id: number,
    job: Partial<MigrationJob>
  ): Promise<MigrationJob | undefined> {
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    
    if (job.status !== undefined) {
      setClauses.push('status = $' + (values.length + 1));
      values.push(job.status);
    }
    
    if (job.error !== undefined) {
      setClauses.push('error = $' + (values.length + 1));
      values.push(job.error);
    }
    
    if (job.progress !== undefined) {
      setClauses.push('progress = $' + (values.length + 1));
      values.push(job.progress);
    }
    
    if (job.options !== undefined) {
      setClauses.push('options = $' + (values.length + 1));
      values.push(JSON.stringify(job.options));
    }
    
    // Add updated_at
    setClauses.push('updated_at = NOW()');
    
    if (setClauses.length === 0) {
      return this.getMigrationJob(id);
    }
    
    // Build and execute query
    const query = `
      UPDATE migration_jobs 
      SET ${setClauses.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await db.execute(query, values);
    return result.length > 0 ? (result[0] as MigrationJob) : undefined;
  }

  async updateMigrationJobProgress(
    id: number,
    progress: number
  ): Promise<MigrationJob | undefined> {
    const result = await db.execute(
      db.sql`
        UPDATE migration_jobs 
        SET progress = ${progress}, updated_at = NOW() 
        WHERE id = ${id} 
        RETURNING *
      `
    );
    return result.length > 0 ? (result[0] as MigrationJob) : undefined;
  }

  async updateMigrationJobStatus(
    id: number,
    status: string,
    error?: string
  ): Promise<MigrationJob | undefined> {
    const result = await db.execute(
      db.sql`
        UPDATE migration_jobs 
        SET status = ${status}, error = ${error || null}, updated_at = NOW() 
        WHERE id = ${id} 
        RETURNING *
      `
    );
    return result.length > 0 ? (result[0] as MigrationJob) : undefined;
  }

  // Migration step methods
  async getMigrationSteps(migrationJobId: number): Promise<MigrationStep[]> {
    const steps = await db.execute(
      db.sql`
        SELECT * FROM migration_steps 
        WHERE migration_job_id = ${migrationJobId} 
        ORDER BY started_at ASC
      `
    );
    return steps as MigrationStep[];
  }

  async getMigrationStep(id: number): Promise<MigrationStep | undefined> {
    const steps = await db.execute(
      db.sql`SELECT * FROM migration_steps WHERE id = ${id} LIMIT 1`
    );
    return steps.length > 0 ? (steps[0] as MigrationStep) : undefined;
  }

  async createMigrationStep(step: InsertMigrationStep): Promise<MigrationStep> {
    const result = await db.execute(
      db.sql`
        INSERT INTO migration_steps (
          migration_job_id, 
          step_name, 
          status, 
          message, 
          progress
        ) VALUES (
          ${step.migrationJobId}, 
          ${step.stepName}, 
          ${step.status}, 
          ${step.message || null}, 
          ${step.progress || 0}
        ) RETURNING *
      `
    );
    return result[0] as MigrationStep;
  }

  async updateMigrationStep(
    id: number,
    step: Partial<MigrationStep>
  ): Promise<MigrationStep | undefined> {
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    
    if (step.status !== undefined) {
      setClauses.push('status = $' + (values.length + 1));
      values.push(step.status);
    }
    
    if (step.message !== undefined) {
      setClauses.push('message = $' + (values.length + 1));
      values.push(step.message);
    }
    
    if (step.progress !== undefined) {
      setClauses.push('progress = $' + (values.length + 1));
      values.push(step.progress);
    }
    
    if (step.completedAt !== undefined) {
      setClauses.push('completed_at = $' + (values.length + 1));
      values.push(step.completedAt);
    }
    
    if (setClauses.length === 0) {
      return this.getMigrationStep(id);
    }
    
    // Build and execute query
    const query = `
      UPDATE migration_steps 
      SET ${setClauses.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await db.execute(query, values);
    return result.length > 0 ? (result[0] as MigrationStep) : undefined;
  }

  async updateMigrationStepProgress(
    id: number,
    progress: number,
    message?: string
  ): Promise<MigrationStep | undefined> {
    const result = await db.execute(
      db.sql`
        UPDATE migration_steps 
        SET progress = ${progress}, message = ${message || null} 
        WHERE id = ${id} 
        RETURNING *
      `
    );
    return result.length > 0 ? (result[0] as MigrationStep) : undefined;
  }

  async updateMigrationStepStatus(
    id: number,
    status: string,
    message?: string
  ): Promise<MigrationStep | undefined> {
    const completedAt = status === "completed" || status === "failed" ? "NOW()" : null;
    
    const result = await db.execute(
      db.sql`
        UPDATE migration_steps 
        SET status = ${status}, 
            message = ${message || null},
            completed_at = ${completedAt ? db.sql`NOW()` : null}
        WHERE id = ${id} 
        RETURNING *
      `
    );
    return result.length > 0 ? (result[0] as MigrationStep) : undefined;
  }

  // Dataset files methods
  async getDatasetFiles(datasetId: number): Promise<DatasetFile[]> {
    const files = await db.execute(
      db.sql`
        SELECT * FROM dataset_files 
        WHERE dataset_id = ${datasetId} 
        ORDER BY name ASC
      `
    );
    return files as DatasetFile[];
  }

  async getDatasetFile(id: number): Promise<DatasetFile | undefined> {
    const files = await db.execute(
      db.sql`SELECT * FROM dataset_files WHERE id = ${id} LIMIT 1`
    );
    return files.length > 0 ? (files[0] as DatasetFile) : undefined;
  }

  async createDatasetFile(file: InsertDatasetFile): Promise<DatasetFile> {
    const result = await db.execute(
      db.sql`
        INSERT INTO dataset_files (
          dataset_id, 
          name, 
          path, 
          size, 
          type, 
          url
        ) VALUES (
          ${file.datasetId}, 
          ${file.name}, 
          ${file.path}, 
          ${file.size}, 
          ${file.type}, 
          ${file.url}
        ) RETURNING *
      `
    );
    return result[0] as DatasetFile;
  }

  async updateDatasetFile(
    id: number,
    file: Partial<DatasetFile>
  ): Promise<DatasetFile | undefined> {
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    
    if (file.name !== undefined) {
      setClauses.push('name = $' + (values.length + 1));
      values.push(file.name);
    }
    
    if (file.path !== undefined) {
      setClauses.push('path = $' + (values.length + 1));
      values.push(file.path);
    }
    
    if (file.size !== undefined) {
      setClauses.push('size = $' + (values.length + 1));
      values.push(file.size);
    }
    
    if (file.type !== undefined) {
      setClauses.push('type = $' + (values.length + 1));
      values.push(file.type);
    }
    
    if (file.url !== undefined) {
      setClauses.push('url = $' + (values.length + 1));
      values.push(file.url);
    }
    
    if (setClauses.length === 0) {
      return this.getDatasetFile(id);
    }
    
    // Build and execute query
    const query = `
      UPDATE dataset_files 
      SET ${setClauses.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await db.execute(query, values);
    return result.length > 0 ? (result[0] as DatasetFile) : undefined;
  }

  async deleteDatasetFile(id: number): Promise<boolean> {
    const result = await db.execute(
      db.sql`DELETE FROM dataset_files WHERE id = ${id} RETURNING id`
    );
    return result.length > 0;
  }

  // Analysis report methods
  async getAnalysisReports(datasetId: number): Promise<AnalysisReport[]> {
    const reports = await db.execute(
      db.sql`
        SELECT * FROM analysis_reports 
        WHERE dataset_id = ${datasetId} 
        ORDER BY created_at DESC
      `
    );
    return reports as AnalysisReport[];
  }

  async getAnalysisReport(id: number): Promise<AnalysisReport | undefined> {
    const reports = await db.execute(
      db.sql`SELECT * FROM analysis_reports WHERE id = ${id} LIMIT 1`
    );
    return reports.length > 0 ? (reports[0] as AnalysisReport) : undefined;
  }

  async createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport> {
    const result = await db.execute(
      db.sql`
        INSERT INTO analysis_reports (
          dataset_id, 
          quality, 
          completeness, 
          usability, 
          report, 
          ai_generated
        ) VALUES (
          ${report.datasetId}, 
          ${report.quality}, 
          ${report.completeness}, 
          ${report.usability}, 
          ${JSON.stringify(report.report)}, 
          ${report.aiGenerated}
        ) RETURNING *
      `
    );
    return result[0] as AnalysisReport;
  }

  async updateAnalysisReport(
    id: number,
    report: Partial<AnalysisReport>
  ): Promise<AnalysisReport | undefined> {
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    
    if (report.quality !== undefined) {
      setClauses.push('quality = $' + (values.length + 1));
      values.push(report.quality);
    }
    
    if (report.completeness !== undefined) {
      setClauses.push('completeness = $' + (values.length + 1));
      values.push(report.completeness);
    }
    
    if (report.usability !== undefined) {
      setClauses.push('usability = $' + (values.length + 1));
      values.push(report.usability);
    }
    
    if (report.report !== undefined) {
      setClauses.push('report = $' + (values.length + 1));
      values.push(JSON.stringify(report.report));
    }
    
    if (report.aiGenerated !== undefined) {
      setClauses.push('ai_generated = $' + (values.length + 1));
      values.push(report.aiGenerated);
    }
    
    if (setClauses.length === 0) {
      return this.getAnalysisReport(id);
    }
    
    // Build and execute query
    const query = `
      UPDATE analysis_reports 
      SET ${setClauses.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await db.execute(query, values);
    return result.length > 0 ? (result[0] as AnalysisReport) : undefined;
  }
}