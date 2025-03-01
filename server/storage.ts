import { 
  users, type User, type InsertUser,
  datasets, type Dataset, type InsertDataset,
  migrationJobs, type MigrationJob, type InsertMigrationJob,
  migrationSteps, type MigrationStep, type InsertMigrationStep,
  datasetFiles, type DatasetFile, type InsertDatasetFile,
  analysisReports, type AnalysisReport, type InsertAnalysisReport,
  MigrationStatusEnum
} from "@shared/schema";

// Extend storage interface with all needed CRUD operations
export interface IStorage {
  // Original user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dataset methods
  getDatasets(): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  getDatasetByName(name: string): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: number, dataset: Partial<Dataset>): Promise<Dataset | undefined>;
  deleteDataset(id: number): Promise<boolean>;
  
  // Migration job methods
  getMigrationJobs(): Promise<MigrationJob[]>;
  getMigrationJob(id: number): Promise<MigrationJob | undefined>;
  getMigrationJobsByDatasetId(datasetId: number): Promise<MigrationJob[]>;
  getRecentMigrationJobs(limit: number): Promise<MigrationJob[]>;
  createMigrationJob(job: InsertMigrationJob): Promise<MigrationJob>;
  updateMigrationJob(id: number, job: Partial<MigrationJob>): Promise<MigrationJob | undefined>;
  updateMigrationJobProgress(id: number, progress: number): Promise<MigrationJob | undefined>;
  updateMigrationJobStatus(id: number, status: string, error?: string): Promise<MigrationJob | undefined>;
  
  // Migration step methods
  getMigrationSteps(migrationJobId: number): Promise<MigrationStep[]>;
  getMigrationStep(id: number): Promise<MigrationStep | undefined>;
  createMigrationStep(step: InsertMigrationStep): Promise<MigrationStep>;
  updateMigrationStep(id: number, step: Partial<MigrationStep>): Promise<MigrationStep | undefined>;
  updateMigrationStepProgress(id: number, progress: number, message?: string): Promise<MigrationStep | undefined>;
  updateMigrationStepStatus(id: number, status: string, message?: string): Promise<MigrationStep | undefined>;
  
  // Dataset files methods
  getDatasetFiles(datasetId: number): Promise<DatasetFile[]>;
  getDatasetFile(id: number): Promise<DatasetFile | undefined>;
  createDatasetFile(file: InsertDatasetFile): Promise<DatasetFile>;
  updateDatasetFile(id: number, file: Partial<DatasetFile>): Promise<DatasetFile | undefined>;
  deleteDatasetFile(id: number): Promise<boolean>;
  
  // Analysis report methods
  getAnalysisReports(datasetId: number): Promise<AnalysisReport[]>;
  getAnalysisReport(id: number): Promise<AnalysisReport | undefined>;
  createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport>;
  updateAnalysisReport(id: number, report: Partial<AnalysisReport>): Promise<AnalysisReport | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private datasets: Map<number, Dataset>;
  private migrationJobs: Map<number, MigrationJob>;
  private migrationSteps: Map<number, MigrationStep>;
  private datasetFiles: Map<number, DatasetFile>;
  private analysisReports: Map<number, AnalysisReport>;
  
  private userId: number;
  private datasetId: number;
  private migrationJobId: number;
  private migrationStepId: number;
  private datasetFileId: number;
  private analysisReportId: number;

  constructor() {
    this.users = new Map();
    this.datasets = new Map();
    this.migrationJobs = new Map();
    this.migrationSteps = new Map();
    this.datasetFiles = new Map();
    this.analysisReports = new Map();
    
    this.userId = 1;
    this.datasetId = 1;
    this.migrationJobId = 1;
    this.migrationStepId = 1;
    this.datasetFileId = 1;
    this.analysisReportId = 1;
    
    // Add some sample data
    this.seedSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Dataset methods
  async getDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }
  
  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }
  
  async getDatasetByName(name: string): Promise<Dataset | undefined> {
    return Array.from(this.datasets.values()).find(
      (dataset) => dataset.name === name,
    );
  }
  
  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = this.datasetId++;
    const now = new Date();
    const dataset: Dataset = { 
      ...insertDataset, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.datasets.set(id, dataset);
    return dataset;
  }
  
  async updateDataset(id: number, dataset: Partial<Dataset>): Promise<Dataset | undefined> {
    const existingDataset = this.datasets.get(id);
    if (!existingDataset) return undefined;
    
    const updatedDataset = { 
      ...existingDataset, 
      ...dataset,
      updatedAt: new Date()
    };
    this.datasets.set(id, updatedDataset);
    return updatedDataset;
  }
  
  async deleteDataset(id: number): Promise<boolean> {
    return this.datasets.delete(id);
  }
  
  // Migration job methods
  async getMigrationJobs(): Promise<MigrationJob[]> {
    return Array.from(this.migrationJobs.values());
  }
  
  async getMigrationJob(id: number): Promise<MigrationJob | undefined> {
    return this.migrationJobs.get(id);
  }
  
  async getMigrationJobsByDatasetId(datasetId: number): Promise<MigrationJob[]> {
    return Array.from(this.migrationJobs.values()).filter(
      (job) => job.datasetId === datasetId,
    );
  }
  
  async getRecentMigrationJobs(limit: number): Promise<MigrationJob[]> {
    return Array.from(this.migrationJobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async createMigrationJob(insertJob: InsertMigrationJob): Promise<MigrationJob> {
    const id = this.migrationJobId++;
    const now = new Date();
    const job: MigrationJob = { 
      ...insertJob, 
      id,
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
      createdAt: now
    };
    this.migrationJobs.set(id, job);
    return job;
  }
  
  async updateMigrationJob(id: number, job: Partial<MigrationJob>): Promise<MigrationJob | undefined> {
    const existingJob = this.migrationJobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...job };
    this.migrationJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async updateMigrationJobProgress(id: number, progress: number): Promise<MigrationJob | undefined> {
    const existingJob = this.migrationJobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, progress };
    this.migrationJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async updateMigrationJobStatus(id: number, status: string, error?: string): Promise<MigrationJob | undefined> {
    const existingJob = this.migrationJobs.get(id);
    if (!existingJob) return undefined;
    
    const now = new Date();
    const updates: Partial<MigrationJob> = { status };
    
    if (status === 'in_progress' && !existingJob.startedAt) {
      updates.startedAt = now;
    }
    
    if (status === 'completed' || status === 'failed') {
      updates.completedAt = now;
    }
    
    if (error) {
      updates.error = error;
    }
    
    const updatedJob = { ...existingJob, ...updates };
    this.migrationJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  // Migration step methods
  async getMigrationSteps(migrationJobId: number): Promise<MigrationStep[]> {
    return Array.from(this.migrationSteps.values())
      .filter((step) => step.migrationJobId === migrationJobId)
      .sort((a, b) => a.id - b.id);
  }
  
  async getMigrationStep(id: number): Promise<MigrationStep | undefined> {
    return this.migrationSteps.get(id);
  }
  
  async createMigrationStep(insertStep: InsertMigrationStep): Promise<MigrationStep> {
    const id = this.migrationStepId++;
    const now = new Date();
    const step: MigrationStep = { 
      ...insertStep, 
      id,
      progress: 0,
      message: null,
      startedAt: null,
      completedAt: null,
      createdAt: now
    };
    this.migrationSteps.set(id, step);
    return step;
  }
  
  async updateMigrationStep(id: number, step: Partial<MigrationStep>): Promise<MigrationStep | undefined> {
    const existingStep = this.migrationSteps.get(id);
    if (!existingStep) return undefined;
    
    const updatedStep = { ...existingStep, ...step };
    this.migrationSteps.set(id, updatedStep);
    return updatedStep;
  }
  
  async updateMigrationStepProgress(id: number, progress: number, message?: string): Promise<MigrationStep | undefined> {
    const existingStep = this.migrationSteps.get(id);
    if (!existingStep) return undefined;
    
    const updates: Partial<MigrationStep> = { progress };
    if (message) {
      updates.message = message;
    }
    
    const updatedStep = { ...existingStep, ...updates };
    this.migrationSteps.set(id, updatedStep);
    return updatedStep;
  }
  
  async updateMigrationStepStatus(id: number, status: string, message?: string): Promise<MigrationStep | undefined> {
    const existingStep = this.migrationSteps.get(id);
    if (!existingStep) return undefined;
    
    const now = new Date();
    const updates: Partial<MigrationStep> = { status };
    
    if (status === 'in_progress' && !existingStep.startedAt) {
      updates.startedAt = now;
    }
    
    if (status === 'completed' || status === 'failed') {
      updates.completedAt = now;
    }
    
    if (message) {
      updates.message = message;
    }
    
    const updatedStep = { ...existingStep, ...updates };
    this.migrationSteps.set(id, updatedStep);
    return updatedStep;
  }
  
  // Dataset files methods
  async getDatasetFiles(datasetId: number): Promise<DatasetFile[]> {
    return Array.from(this.datasetFiles.values())
      .filter((file) => file.datasetId === datasetId);
  }
  
  async getDatasetFile(id: number): Promise<DatasetFile | undefined> {
    return this.datasetFiles.get(id);
  }
  
  async createDatasetFile(insertFile: InsertDatasetFile): Promise<DatasetFile> {
    const id = this.datasetFileId++;
    const now = new Date();
    const file: DatasetFile = { 
      ...insertFile, 
      id,
      createdAt: now
    };
    this.datasetFiles.set(id, file);
    return file;
  }
  
  async updateDatasetFile(id: number, file: Partial<DatasetFile>): Promise<DatasetFile | undefined> {
    const existingFile = this.datasetFiles.get(id);
    if (!existingFile) return undefined;
    
    const updatedFile = { ...existingFile, ...file };
    this.datasetFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteDatasetFile(id: number): Promise<boolean> {
    return this.datasetFiles.delete(id);
  }
  
  // Analysis report methods
  async getAnalysisReports(datasetId: number): Promise<AnalysisReport[]> {
    return Array.from(this.analysisReports.values())
      .filter((report) => report.datasetId === datasetId);
  }
  
  async getAnalysisReport(id: number): Promise<AnalysisReport | undefined> {
    return this.analysisReports.get(id);
  }
  
  async createAnalysisReport(insertReport: InsertAnalysisReport): Promise<AnalysisReport> {
    const id = this.analysisReportId++;
    const now = new Date();
    const report: AnalysisReport = { 
      ...insertReport, 
      id,
      createdAt: now
    };
    this.analysisReports.set(id, report);
    return report;
  }
  
  async updateAnalysisReport(id: number, report: Partial<AnalysisReport>): Promise<AnalysisReport | undefined> {
    const existingReport = this.analysisReports.get(id);
    if (!existingReport) return undefined;
    
    const updatedReport = { ...existingReport, ...report };
    this.analysisReports.set(id, updatedReport);
    return updatedReport;
  }

  // Helper method to seed some sample data
  private seedSampleData() {
    // Create sample datasets
    const dataset1 = this.createDataset({
      name: "news-classification",
      description: "BBC news articles classified by category",
      originalPlatform: "github",
      currentPlatform: "huggingface",
      originalUrl: "https://github.com/username/news-classification",
      currentUrl: "https://huggingface.co/datasets/username/news-classification",
      filesCount: 3,
      totalSize: 3100000, // 3.1 MB
      metadata: { 
        license: "MIT",
        language: "en",
        categories: ["text", "classification", "news"]
      }
    });

    const dataset2 = this.createDataset({
      name: "image-dataset",
      description: "Collection of labeled images for classification",
      originalPlatform: "kaggle",
      currentPlatform: "kaggle",
      originalUrl: "https://kaggle.com/datasets/username/image-dataset",
      currentUrl: "https://kaggle.com/datasets/username/image-dataset",
      filesCount: 5,
      totalSize: 250000000, // 250 MB
      metadata: { 
        license: "CC BY-SA 4.0",
        categories: ["image", "classification"]
      }
    });

    const dataset3 = this.createDataset({
      name: "audio-samples",
      description: "Audio samples for speech recognition",
      originalPlatform: "github",
      currentPlatform: "github",
      originalUrl: "https://github.com/username/audio-samples",
      currentUrl: "https://github.com/username/audio-samples",
      filesCount: 4,
      totalSize: 150000000, // 150 MB
      metadata: { 
        license: "Apache 2.0",
        language: "en-us",
        categories: ["audio", "speech"]
      }
    });

    // Create sample migration jobs
    const job1 = this.createMigrationJob({
      datasetId: 1,
      sourcePlatform: "github",
      destinationPlatform: "huggingface",
      sourceUrl: "https://github.com/username/news-classification",
      destinationUrl: "https://huggingface.co/datasets/username/news-classification",
      status: "completed",
      generateCard: true,
      validateSchema: false,
      runAnalysis: false
    });

    const job2 = this.createMigrationJob({
      datasetId: 2,
      sourcePlatform: "kaggle",
      destinationPlatform: "huggingface",
      sourceUrl: "https://kaggle.com/datasets/username/image-dataset",
      destinationUrl: null,
      status: "in_progress",
      generateCard: true,
      validateSchema: true,
      runAnalysis: true
    });

    const job3 = this.createMigrationJob({
      datasetId: 3,
      sourcePlatform: "github",
      destinationPlatform: "huggingface",
      sourceUrl: "https://github.com/username/audio-samples",
      destinationUrl: null,
      status: "failed",
      error: "Schema validation error",
      generateCard: true,
      validateSchema: true,
      runAnalysis: false
    });

    // Update job progress
    this.updateMigrationJobProgress(2, 45);

    // Create sample migration steps
    this.createMigrationStep({
      migrationJobId: 1,
      name: "Repository validation",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 1,
      name: "File selection",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 1,
      name: "Downloading files",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 1,
      name: "Creating HF repository",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 1,
      name: "Dataset card creation",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 1,
      name: "Finalization",
      status: "completed"
    });

    // Steps for in-progress job
    this.createMigrationStep({
      migrationJobId: 2,
      name: "Repository validation",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 2,
      name: "File selection",
      status: "completed"
    });
    
    const downloadStep = this.createMigrationStep({
      migrationJobId: 2,
      name: "Downloading files",
      status: "in_progress"
    });
    this.updateMigrationStepProgress(downloadStep.id, 67, "2 of 3 files downloaded");
    
    this.createMigrationStep({
      migrationJobId: 2,
      name: "Creating HF repository",
      status: "pending"
    });
    
    this.createMigrationStep({
      migrationJobId: 2,
      name: "Dataset card creation",
      status: "pending"
    });
    
    this.createMigrationStep({
      migrationJobId: 2,
      name: "Finalization",
      status: "pending"
    });

    // Steps for failed job
    this.createMigrationStep({
      migrationJobId: 3,
      name: "Repository validation",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 3,
      name: "File selection",
      status: "completed"
    });
    
    this.createMigrationStep({
      migrationJobId: 3,
      name: "Schema validation",
      status: "failed",
      message: "Dataset structure does not match required schema"
    });

    // Create sample dataset files
    this.createDatasetFile({
      datasetId: 1,
      name: "train.csv",
      path: "/train.csv",
      size: 2300000, // 2.3 MB
      type: "csv",
      selected: true
    });
    
    this.createDatasetFile({
      datasetId: 1,
      name: "test.csv",
      path: "/test.csv",
      size: 1100000, // 1.1 MB
      type: "csv",
      selected: true
    });
    
    this.createDatasetFile({
      datasetId: 1,
      name: "validation.csv",
      path: "/validation.csv",
      size: 650000, // 650 KB
      type: "csv",
      selected: true
    });
    
    this.createDatasetFile({
      datasetId: 1,
      name: "README.md",
      path: "/README.md",
      size: 12000, // 12 KB
      type: "md",
      selected: false
    });
    
    this.createDatasetFile({
      datasetId: 1,
      name: "LICENSE",
      path: "/LICENSE",
      size: 4000, // 4 KB
      type: "text",
      selected: false
    });

    // Create sample analysis report
    this.createAnalysisReport({
      datasetId: 1,
      quality: 87,
      completeness: 92,
      usability: 85,
      report: {
        summary: "High-quality news classification dataset with good coverage across categories",
        issues: [],
        recommendations: [
          "Consider adding more examples to the 'tech' category which is slightly underrepresented"
        ],
        metrics: {
          classDistribution: {
            business: 510,
            entertainment: 386,
            politics: 417,
            sport: 511,
            tech: 401
          },
          averageTextLength: 3721,
          missingValues: 0
        }
      },
      aiGenerated: true
    });
  }
}

export const storage = new MemStorage();
