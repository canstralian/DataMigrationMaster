import {
  Platform,
  Dataset,
  InsertDataset,
  MigrationJob,
  InsertMigrationJob,
  MigrationStep,
  InsertMigrationStep,
  DatasetFile,
  InsertDatasetFile,
} from "@shared/schema";
import { IStorage } from "../storage";
import * as githubService from "./github";
import * as kaggleService from "./kaggle";
import * as huggingfaceService from "./huggingface";
import * as anthropicService from "./anthropic";

/**
 * Service to handle dataset migration between platforms
 */
export class MigrationService {
  constructor(private storage: IStorage) {}

  /**
   * Starts a migration job
   * @param sourcePlatform Source platform
   * @param sourceUrl Source URL
   * @param destinationPlatform Destination platform
   * @param options Additional migration options
   * @returns Created migration job
   */
  async startMigration(
    sourcePlatform: Platform,
    sourceUrl: string,
    destinationPlatform: Platform,
    options: {
      repositoryName?: string;
      isPrivate?: boolean;
      generateCard?: boolean;
      validateSchema?: boolean;
      runAnalysis?: boolean;
      selectedFiles?: string[];
    },
  ): Promise<MigrationJob> {
    // 1. Create or get dataset
    const dataset = await this.createDatasetFromSource(
      sourcePlatform,
      sourceUrl,
    );

    // 2. Create migration job
    const migrationJob = await this.storage.createMigrationJob({
      datasetId: dataset.id,
      sourcePlatform,
      destinationPlatform,
      sourceUrl,
      destinationUrl: null,
      status: "pending",
      generateCard: options.generateCard || false,
      validateSchema: options.validateSchema || false,
      runAnalysis: options.runAnalysis || false,
    });

    // 3. Create migration steps
    const steps = [
      { name: "Repository validation", status: "pending" },
      { name: "File selection", status: "pending" },
      { name: "Downloading files", status: "pending" },
      { name: "Creating destination repository", status: "pending" },
    ];

    if (options.generateCard) {
      steps.push({ name: "Dataset card creation", status: "pending" });
    }

    if (options.validateSchema) {
      steps.push({ name: "Schema validation", status: "pending" });
    }

    if (options.runAnalysis) {
      steps.push({ name: "AI analysis", status: "pending" });
    }

    steps.push({ name: "Finalization", status: "pending" });

    for (const step of steps) {
      await this.storage.createMigrationStep({
        migrationJobId: migrationJob.id,
        name: step.name,
        status: step.status,
      });
    }

    // 4. Start the migration process (async)
    this.processMigration(migrationJob.id, options).catch((error) => {
      console.error(`Migration job ${migrationJob.id} failed:`, error);
    });

    return migrationJob;
  }

  /**
   * Updates the progress of a migration job
   * @param jobId Migration job ID
   * @param progress Progress percentage (0-100)
   */
  private async updateProgress(jobId: number, progress: number): Promise<void> {
    await this.storage.updateMigrationJobProgress(jobId, progress);
  }

  /**
   * Process a migration job
   * @param jobId Migration job ID
   * @param options Migration options
   */
  private async processMigration(
    jobId: number,
    options: {
      repositoryName?: string;
      isPrivate?: boolean;
      generateCard?: boolean;
      validateSchema?: boolean;
      runAnalysis?: boolean;
      selectedFiles?: string[];
    },
  ): Promise<void> {
    try {
      // Get the migration job
      const migrationJob = await this.storage.getMigrationJob(jobId);
      if (!migrationJob) {
        throw new Error(`Migration job ${jobId} not found`);
      }

      // Get the dataset
      const dataset = await this.storage.getDataset(migrationJob.datasetId);
      if (!dataset) {
        throw new Error(`Dataset ${migrationJob.datasetId} not found`);
      }

      // Update job status to in_progress
      await this.storage.updateMigrationJobStatus(jobId, "in_progress");

      // Get all steps
      const steps = await this.storage.getMigrationSteps(jobId);

      // Step 1: Repository validation
      const validationStep = steps.find(
        (step) => step.name === "Repository validation",
      );
      if (validationStep) {
        await this.storage.updateMigrationStepStatus(
          validationStep.id,
          "in_progress",
        );

        // Perform validation based on source platform
        let validationMessage;
        switch (migrationJob.sourcePlatform) {
          case "github":
            const repoInfo = await githubService.getRepositoryInfo(
              migrationJob.sourceUrl,
            );
            validationMessage = `Validated GitHub repository: ${repoInfo.name}`;
            break;
          case "kaggle":
            const kaggleInfo = await kaggleService.getDatasetInfo(
              migrationJob.sourceUrl,
            );
            validationMessage = `Validated Kaggle dataset: ${kaggleInfo.title}`;
            break;
          case "huggingface":
            const hfInfo = await huggingfaceService.getDatasetInfo(
              migrationJob.sourceUrl,
            );
            validationMessage = `Validated Hugging Face dataset: ${hfInfo.id}`;
            break;
        }

        await this.storage.updateMigrationStepStatus(
          validationStep.id,
          "completed",
          validationMessage,
        );
        await this.updateProgress(jobId, 10);
      }

      // Step 2: File selection
      const fileSelectionStep = steps.find(
        (step) => step.name === "File selection",
      );
      if (fileSelectionStep) {
        await this.storage.updateMigrationStepStatus(
          fileSelectionStep.id,
          "in_progress",
        );

        // Get files from the dataset
        const files = await this.storage.getDatasetFiles(dataset.id);

        // If selectedFiles option is provided, update file selection
        if (options.selectedFiles && options.selectedFiles.length > 0) {
          for (const file of files) {
            const selected = options.selectedFiles.includes(file.name);
            await this.storage.updateDatasetFile(file.id, { selected });
          }
        }

        // Count selected files
        const selectedFiles = files.filter((file) => file.selected);
        const selectedSize = selectedFiles.reduce(
          (total, file) => total + (file.size || 0),
          0,
        );

        const message = `Selected ${selectedFiles.length} files (${this.formatBytes(selectedSize)} total)`;
        await this.storage.updateMigrationStepStatus(
          fileSelectionStep.id,
          "completed",
          message,
        );
        await this.updateProgress(jobId, 20);
      }

      // Step 3: Downloading files
      const downloadStep = steps.find(
        (step) => step.name === "Downloading files",
      );
      if (downloadStep) {
        await this.storage.updateMigrationStepStatus(
          downloadStep.id,
          "in_progress",
        );

        // Get selected files
        const files = await this.storage.getDatasetFiles(dataset.id);
        const selectedFiles = files.filter((file) => file.selected);

        // Simulate downloading files (one by one)
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
          const message = `${i + 1} of ${selectedFiles.length} files downloaded`;

          await this.storage.updateMigrationStepProgress(
            downloadStep.id,
            progress,
            message,
          );

          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        await this.storage.updateMigrationStepStatus(
          downloadStep.id,
          "completed",
          `All ${selectedFiles.length} files downloaded`,
        );
        await this.updateProgress(jobId, 40);
      }

      // Step 4: Creating destination repository
      const createRepoStep = steps.find(
        (step) => step.name === "Creating destination repository",
      );
      if (createRepoStep) {
        await this.storage.updateMigrationStepStatus(
          createRepoStep.id,
          "in_progress",
        );

        // Create repository based on destination platform
        let destinationUrl;
        switch (migrationJob.destinationPlatform) {
          case "huggingface":
            const repoName = options.repositoryName || dataset.name;
            destinationUrl = await huggingfaceService.createDataset(
              repoName,
              options.isPrivate || false,
            );
            break;
          // Add cases for other destination platforms if needed
          default:
            throw new Error(
              `Unsupported destination platform: ${migrationJob.destinationPlatform}`,
            );
        }

        // Update migration job with destination URL
        await this.storage.updateMigrationJob(jobId, { destinationUrl });

        await this.storage.updateMigrationStepStatus(
          createRepoStep.id,
          "completed",
          `Created repository: ${destinationUrl}`,
        );
        await this.updateProgress(jobId, 60);
      }

      // Step 5 (Optional): Dataset card creation
      const cardStep = steps.find(
        (step) => step.name === "Dataset card creation",
      );
      if (cardStep && options.generateCard) {
        await this.storage.updateMigrationStepStatus(
          cardStep.id,
          "in_progress",
        );

        // Generate dataset card using Anthropic
        const cardContent = await anthropicService.generateDatasetCard(
          dataset.name,
          dataset.description || "",
          dataset.metadata || {},
        );

        // Simulate upload of card to destination
        if (migrationJob.destinationUrl) {
          // For demo, we're just logging this
          console.log(`Uploading README.md to ${migrationJob.destinationUrl}`);
        }

        await this.storage.updateMigrationStepStatus(
          cardStep.id,
          "completed",
          "Dataset card created and uploaded",
        );
        await this.updateProgress(jobId, 70);
      }

      // Step 6 (Optional): Schema validation
      const schemaStep = steps.find(
        (step) => step.name === "Schema validation",
      );
      if (schemaStep && options.validateSchema) {
        await this.storage.updateMigrationStepStatus(
          schemaStep.id,
          "in_progress",
        );

        // Simulate schema validation
        const isValid = Math.random() > 0.2; // 80% chance of success for demo

        if (isValid) {
          await this.storage.updateMigrationStepStatus(
            schemaStep.id,
            "completed",
            "Dataset schema validation passed",
          );
        } else {
          await this.storage.updateMigrationStepStatus(
            schemaStep.id,
            "failed",
            "Schema validation failed: inconsistent column names",
          );
          await this.storage.updateMigrationJobStatus(
            jobId,
            "failed",
            "Schema validation failed",
          );
          return; // Stop migration if validation fails
        }

        await this.updateProgress(jobId, 80);
      }

      // Step 7 (Optional): AI analysis
      const analysisStep = steps.find((step) => step.name === "AI analysis");
      if (analysisStep && options.runAnalysis) {
        await this.storage.updateMigrationStepStatus(
          analysisStep.id,
          "in_progress",
        );

        // Get a sample of data for analysis
        const files = await this.storage.getDatasetFiles(dataset.id);
        const selectedFiles = files.filter((file) => file.selected);

        // Simplified mock analysis for demo
        // In a real implementation, we would actually download and analyze file contents
        const mockSampleData =
          "id,feature1,feature2,target\n1,0.5,0.7,1\n2,0.3,0.2,0\n";

        const analysisResult = await anthropicService.analyzeDataset(
          dataset.name,
          dataset.description || "",
          dataset.metadata || {},
          mockSampleData,
        );

        // Store analysis results
        await this.storage.createAnalysisReport({
          datasetId: dataset.id,
          quality: analysisResult.quality,
          completeness: analysisResult.completeness,
          usability: analysisResult.usability,
          report: analysisResult,
          aiGenerated: true,
        });

        await this.storage.updateMigrationStepStatus(
          analysisStep.id,
          "completed",
          "Dataset analysis completed",
        );
        await this.updateProgress(jobId, 90);
      }

      // Final step: Finalization
      const finalizationStep = steps.find(
        (step) => step.name === "Finalization",
      );
      if (finalizationStep) {
        await this.storage.updateMigrationStepStatus(
          finalizationStep.id,
          "in_progress",
        );

        // Update dataset information
        await this.storage.updateDataset(dataset.id, {
          currentPlatform: migrationJob.destinationPlatform,
          currentUrl: migrationJob.destinationUrl,
        });

        await this.storage.updateMigrationStepStatus(
          finalizationStep.id,
          "completed",
          "Migration completed successfully",
        );
        await this.updateProgress(jobId, 100);
      }

      // Mark migration job as completed
      await this.storage.updateMigrationJobStatus(jobId, "completed");
    } catch (error) {
      console.error(`Error processing migration job ${jobId}:`, error);

      // Mark job as failed
      await this.storage.updateMigrationJobStatus(
        jobId,
        "failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  /**
   * Creates a dataset from a source URL
   * @param platform Source platform
   * @param url Source URL
   * @returns Created dataset
   */
  private async createDatasetFromSource(
    platform: Platform,
    url: string,
  ): Promise<Dataset> {
    let dataset: Dataset;

    // Check if dataset already exists for this URL
    const existingDatasets = await this.storage.getDatasets();
    const existingDataset = existingDatasets.find((d) => d.originalUrl === url);

    if (existingDataset) {
      dataset = existingDataset;
    } else {
      // Create a new dataset based on the platform
      let datasetInfo: Partial<InsertDataset> = {
        originalPlatform: platform,
        currentPlatform: platform,
        originalUrl: url,
        currentUrl: url,
      };

      try {
        switch (platform) {
          case "github": {
            const repoInfo = await githubService.getRepositoryInfo(url);

            datasetInfo = {
              ...datasetInfo,
              name: repoInfo.name,
              description: repoInfo.description,
              metadata: {
                license: repoInfo.license?.name || "Unknown",
                stars: repoInfo.stargazers_count,
                forks: repoInfo.forks_count,
                lastUpdated: repoInfo.updated_at,
              },
            };

            // List files in the repository
            const files = await githubService.listRepositoryFiles(url);
            datasetInfo.filesCount = files.length;
            datasetInfo.totalSize = files.reduce(
              (total, file) => total + file.size,
              0,
            );
            break;
          }

          case "kaggle": {
            const kaggleInfo = await kaggleService.getDatasetInfo(url);

            datasetInfo = {
              ...datasetInfo,
              name: kaggleInfo.title,
              description: kaggleInfo.description,
              metadata: {
                license: kaggleInfo.licenseName,
                owner: kaggleInfo.ownerName,
                downloads: kaggleInfo.downloadCount,
                votes: kaggleInfo.voteCount,
                usabilityRating: kaggleInfo.usabilityRating,
                lastUpdated: kaggleInfo.lastUpdated,
              },
            };

            // List files in the dataset
            const files = await kaggleService.listDatasetFiles(url);
            datasetInfo.filesCount = files.length;
            datasetInfo.totalSize = files.reduce(
              (total, file) => total + file.size,
              0,
            );
            break;
          }

          case "huggingface": {
            const hfInfo = await huggingfaceService.getDatasetInfo(url);

            datasetInfo = {
              ...datasetInfo,
              name: hfInfo.id.split("/")[1],
              description: hfInfo.description,
              metadata: {
                license: hfInfo.license,
                author: hfInfo.author,
                tags: hfInfo.tags,
                downloads: hfInfo.downloads,
                lastUpdated: hfInfo.lastModified,
              },
            };

            // List files in the dataset
            const files = await huggingfaceService.listDatasetFiles(url);
            datasetInfo.filesCount = files.length;
            datasetInfo.totalSize = files.reduce(
              (total, file) => total + (file.size || 0),
              0,
            );
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching information from ${platform}:`, error);

        // Use minimal information if API fails
        datasetInfo.name = `dataset-${Date.now()}`;
        datasetInfo.description = `Dataset imported from ${platform}`;
      }

      // Create the dataset
      dataset = await this.storage.createDataset(datasetInfo as InsertDataset);

      // Add dataset files
      try {
        let files: DatasetFile[] = [];

        switch (platform) {
          case "github": {
            const githubFiles = await githubService.listRepositoryFiles(url);
            files = githubService.convertToDatasetFiles(
              githubFiles,
              dataset.id,
            );
            break;
          }

          case "kaggle": {
            const kaggleFiles = await kaggleService.listDatasetFiles(url);
            files = kaggleService.convertToDatasetFiles(
              kaggleFiles,
              dataset.id,
            );
            break;
          }

          case "huggingface": {
            const hfFiles = await huggingfaceService.listDatasetFiles(url);
            files = huggingfaceService.convertToDatasetFiles(
              hfFiles,
              dataset.id,
            );
            break;
          }
        }

        // Add files to storage
        for (const file of files) {
          await this.storage.createDatasetFile(file);
        }
      } catch (error) {
        console.error(`Error adding files from ${platform}:`, error);
      }
    }

    return dataset;
  }

  /**
   * Format bytes to human-readable size
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
