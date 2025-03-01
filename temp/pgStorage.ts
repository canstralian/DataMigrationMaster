import { sql } from "./db";
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

// Helper function to convert snake_case database fields to camelCase
function snakeToCamel(obj: Record<string, any>): any {
  const newObj: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = obj[key];
    }
  }
  
  return newObj;
}

export class PgStorage implements IStorage {
  constructor() {
    console.log("PostgreSQL storage initialized");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await sql`
      INSERT INTO users (username, email, display_name) 
      VALUES (${user.username}, ${user.email}, ${user.displayName}) 
      RETURNING *
    `;
    return snakeToCamel(result[0]) as User;
  }

  // Dataset methods
  async getDatasets(): Promise<Dataset[]> {
    const result = await sql`SELECT * FROM datasets ORDER BY created_at DESC`;
    return result.map(row => snakeToCamel(row) as Dataset);
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const result = await sql`SELECT * FROM datasets WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as Dataset;
  }

  async getDatasetByName(name: string): Promise<Dataset | undefined> {
    const result = await sql`SELECT * FROM datasets WHERE name = ${name} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as Dataset;
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const result = await sql`
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
        ${dataset.metadata ? JSON.stringify(dataset.metadata) : null}, 
        ${dataset.filesCount || null}, 
        ${dataset.totalSize || null}
      ) RETURNING *
    `;
    return snakeToCamel(result[0]) as Dataset;
  }

  async updateDataset(
    id: number,
    dataset: Partial<Dataset>
  ): Promise<Dataset | undefined> {
    // Build dynamic update query
    const setClauses = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (dataset.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(dataset.name);
    }
    
    if (dataset.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(dataset.description);
    }
    
    if (dataset.currentPlatform !== undefined) {
      setClauses.push(`current_platform = $${paramIndex++}`);
      values.push(dataset.currentPlatform);
    }
    
    if (dataset.metadata !== undefined) {
      setClauses.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(dataset.metadata));
    }
    
    if (dataset.filesCount !== undefined) {
      setClauses.push(`files_count = $${paramIndex++}`);
      values.push(dataset.filesCount);
    }
    
    if (dataset.totalSize !== undefined) {
      setClauses.push(`total_size = $${paramIndex++}`);
      values.push(dataset.totalSize);
    }
    
    // Add updated_at
    setClauses.push('updated_at = NOW()');
    
    if (setClauses.length === 0) {
      return this.getDataset(id);
    }
    
    values.push(id);
    
    // Execute the query using tagged template literal
    const queryText = `
      UPDATE datasets 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    if (result.length === 0) return undefined;
    
    return snakeToCamel(result[0]) as Dataset;
  }

  async deleteDataset(id: number): Promise<boolean> {
    const result = await sql`DELETE FROM datasets WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  }

  // Migration job methods
  async getMigrationJobs(): Promise<MigrationJob[]> {
    const result = await sql`SELECT * FROM migration_jobs ORDER BY created_at DESC`;
    return result.map(row => snakeToCamel(row) as MigrationJob);
  }

  async getMigrationJob(id: number): Promise<MigrationJob | undefined> {
    const result = await sql`SELECT * FROM migration_jobs WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as MigrationJob;
  }

  async getMigrationJobsByDatasetId(datasetId: number): Promise<MigrationJob[]> {
    const result = await sql`
      SELECT * FROM migration_jobs 
      WHERE dataset_id = ${datasetId} 
      ORDER BY created_at DESC
    `;
    return result.map(row => snakeToCamel(row) as MigrationJob);
  }

  async getRecentMigrationJobs(limit: number): Promise<MigrationJob[]> {
    const result = await sql`
      SELECT * FROM migration_jobs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.map(row => snakeToCamel(row) as MigrationJob);
  }

  async createMigrationJob(job: InsertMigrationJob): Promise<MigrationJob> {
    const options = job.options ? JSON.stringify(job.options) : null;
    
    const result = await sql`
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
        ${job.status || 'pending'}, 
        ${job.progress || 0}, 
        ${options}
      ) RETURNING *
    `;
    return snakeToCamel(result[0]) as MigrationJob;
  }

  async updateMigrationJob(
    id: number,
    job: Partial<MigrationJob>
  ): Promise<MigrationJob | undefined> {
    // Build dynamic update query
    const setClauses = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (job.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(job.status);
    }
    
    if (job.error !== undefined) {
      setClauses.push(`error = $${paramIndex++}`);
      values.push(job.error);
    }
    
    if (job.progress !== undefined) {
      setClauses.push(`progress = $${paramIndex++}`);
      values.push(job.progress);
    }
    
    if (job.options !== undefined) {
      setClauses.push(`options = $${paramIndex++}`);
      values.push(JSON.stringify(job.options));
    }
    
    if (job.startedAt !== undefined) {
      setClauses.push(`started_at = $${paramIndex++}`);
      values.push(job.startedAt);
    }
    
    if (job.completedAt !== undefined) {
      setClauses.push(`completed_at = $${paramIndex++}`);
      values.push(job.completedAt);
    }
    
    // Add updated_at
    setClauses.push('updated_at = NOW()');
    
    if (setClauses.length === 0) {
      return this.getMigrationJob(id);
    }
    
    values.push(id);
    
    // Execute the query using tagged template literal
    const queryText = `
      UPDATE migration_jobs 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    if (result.length === 0) return undefined;
    
    return snakeToCamel(result[0]) as MigrationJob;
  }

  async updateMigrationJobProgress(
    id: number,
    progress: number
  ): Promise<MigrationJob | undefined> {
    const result = await sql`
      UPDATE migration_jobs 
      SET progress = ${progress}, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    `;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as MigrationJob;
  }

  async updateMigrationJobStatus(
    id: number,
    status: string,
    error?: string
  ): Promise<MigrationJob | undefined> {
    let updates: any = {};
    
    updates.status = status;
    if (error !== undefined) updates.error = error;
    
    if (status === "in_progress" && !updates.startedAt) {
      updates.startedAt = new Date();
    }
    
    if (status === "completed" || status === "failed") {
      updates.completedAt = new Date();
    }
    
    return this.updateMigrationJob(id, updates);
  }

  // Migration step methods
  async getMigrationSteps(migrationJobId: number): Promise<MigrationStep[]> {
    const result = await sql`
      SELECT * FROM migration_steps 
      WHERE migration_job_id = ${migrationJobId} 
      ORDER BY started_at ASC
    `;
    return result.map(row => snakeToCamel(row) as MigrationStep);
  }

  async getMigrationStep(id: number): Promise<MigrationStep | undefined> {
    const result = await sql`SELECT * FROM migration_steps WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as MigrationStep;
  }

  async createMigrationStep(step: InsertMigrationStep): Promise<MigrationStep> {
    const result = await sql`
      INSERT INTO migration_steps (
        migration_job_id, 
        step_name, 
        status, 
        message, 
        progress
      ) VALUES (
        ${step.migrationJobId}, 
        ${step.name}, 
        ${step.status || 'pending'}, 
        ${step.message || null}, 
        ${step.progress || 0}
      ) RETURNING *
    `;
    return snakeToCamel(result[0]) as MigrationStep;
  }

  async updateMigrationStep(
    id: number,
    step: Partial<MigrationStep>
  ): Promise<MigrationStep | undefined> {
    // Build dynamic update query
    const setClauses = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (step.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(step.status);
    }
    
    if (step.message !== undefined) {
      setClauses.push(`message = $${paramIndex++}`);
      values.push(step.message);
    }
    
    if (step.progress !== undefined) {
      setClauses.push(`progress = $${paramIndex++}`);
      values.push(step.progress);
    }
    
    if (step.startedAt !== undefined) {
      setClauses.push(`started_at = $${paramIndex++}`);
      values.push(step.startedAt);
    }
    
    if (step.completedAt !== undefined) {
      setClauses.push(`completed_at = $${paramIndex++}`);
      values.push(step.completedAt);
    }
    
    if (setClauses.length === 0) {
      return this.getMigrationStep(id);
    }
    
    values.push(id);
    
    // Execute the query using tagged template literal
    const queryText = `
      UPDATE migration_steps 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    if (result.length === 0) return undefined;
    
    return snakeToCamel(result[0]) as MigrationStep;
  }

  async updateMigrationStepProgress(
    id: number,
    progress: number,
    message?: string
  ): Promise<MigrationStep | undefined> {
    const updateFields: any = { progress };
    if (message !== undefined) {
      updateFields.message = message;
    }
    
    return this.updateMigrationStep(id, updateFields);
  }

  async updateMigrationStepStatus(
    id: number,
    status: string,
    message?: string
  ): Promise<MigrationStep | undefined> {
    const updateFields: any = { status };
    
    if (message !== undefined) {
      updateFields.message = message;
    }
    
    if (status === "in_progress" && !updateFields.startedAt) {
      updateFields.startedAt = new Date();
    }
    
    if (status === "completed" || status === "failed") {
      updateFields.completedAt = new Date();
    }
    
    return this.updateMigrationStep(id, updateFields);
  }

  // Dataset files methods
  async getDatasetFiles(datasetId: number): Promise<DatasetFile[]> {
    const result = await sql`
      SELECT * FROM dataset_files 
      WHERE dataset_id = ${datasetId} 
      ORDER BY name ASC
    `;
    return result.map(row => snakeToCamel(row) as DatasetFile);
  }

  async getDatasetFile(id: number): Promise<DatasetFile | undefined> {
    const result = await sql`SELECT * FROM dataset_files WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as DatasetFile;
  }

  async createDatasetFile(file: InsertDatasetFile): Promise<DatasetFile> {
    const result = await sql`
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
        ${file.size || null}, 
        ${file.type || null}, 
        ${file.url || null}
      ) RETURNING *
    `;
    return snakeToCamel(result[0]) as DatasetFile;
  }

  async updateDatasetFile(
    id: number,
    file: Partial<DatasetFile>
  ): Promise<DatasetFile | undefined> {
    // Build dynamic update query
    const setClauses = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (file.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(file.name);
    }
    
    if (file.path !== undefined) {
      setClauses.push(`path = $${paramIndex++}`);
      values.push(file.path);
    }
    
    if (file.size !== undefined) {
      setClauses.push(`size = $${paramIndex++}`);
      values.push(file.size);
    }
    
    if (file.type !== undefined) {
      setClauses.push(`type = $${paramIndex++}`);
      values.push(file.type);
    }
    
    if (file.url !== undefined) {
      setClauses.push(`url = $${paramIndex++}`);
      values.push(file.url);
    }
    
    if (setClauses.length === 0) {
      return this.getDatasetFile(id);
    }
    
    values.push(id);
    
    // Execute the query
    const queryText = `
      UPDATE dataset_files 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    if (result.length === 0) return undefined;
    
    return snakeToCamel(result[0]) as DatasetFile;
  }

  async deleteDatasetFile(id: number): Promise<boolean> {
    const result = await sql`DELETE FROM dataset_files WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  }

  // Analysis report methods
  async getAnalysisReports(datasetId: number): Promise<AnalysisReport[]> {
    const result = await sql`
      SELECT * FROM analysis_reports 
      WHERE dataset_id = ${datasetId} 
      ORDER BY created_at DESC
    `;
    return result.map(row => snakeToCamel(row) as AnalysisReport);
  }

  async getAnalysisReport(id: number): Promise<AnalysisReport | undefined> {
    const result = await sql`SELECT * FROM analysis_reports WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return undefined;
    return snakeToCamel(result[0]) as AnalysisReport;
  }

  async createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport> {
    const result = await sql`
      INSERT INTO analysis_reports (
        dataset_id, 
        quality, 
        completeness, 
        usability, 
        report, 
        ai_generated
      ) VALUES (
        ${report.datasetId}, 
        ${report.quality || null}, 
        ${report.completeness || null}, 
        ${report.usability || null}, 
        ${report.report ? JSON.stringify(report.report) : null}, 
        ${report.aiGenerated || false}
      ) RETURNING *
    `;
    return snakeToCamel(result[0]) as AnalysisReport;
  }

  async updateAnalysisReport(
    id: number,
    report: Partial<AnalysisReport>
  ): Promise<AnalysisReport | undefined> {
    // Build dynamic update query
    const setClauses = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (report.quality !== undefined) {
      setClauses.push(`quality = $${paramIndex++}`);
      values.push(report.quality);
    }
    
    if (report.completeness !== undefined) {
      setClauses.push(`completeness = $${paramIndex++}`);
      values.push(report.completeness);
    }
    
    if (report.usability !== undefined) {
      setClauses.push(`usability = $${paramIndex++}`);
      values.push(report.usability);
    }
    
    if (report.report !== undefined) {
      setClauses.push(`report = $${paramIndex++}`);
      values.push(JSON.stringify(report.report));
    }
    
    if (report.aiGenerated !== undefined) {
      setClauses.push(`ai_generated = $${paramIndex++}`);
      values.push(report.aiGenerated);
    }
    
    if (setClauses.length === 0) {
      return this.getAnalysisReport(id);
    }
    
    values.push(id);
    
    // Execute the query
    const queryText = `
      UPDATE analysis_reports 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    if (result.length === 0) return undefined;
    
    return snakeToCamel(result[0]) as AnalysisReport;
  }
}