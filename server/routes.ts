import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MigrationService } from "./services/migrationService";
import z from "zod";
import { 
  insertDatasetSchema, 
  insertMigrationJobSchema, 
  PlatformEnum, 
  MigrationStatusEnum 
} from '@shared/schema';

// Create migration service
const migrationService = new MigrationService(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all routes with /api
  
  // Datasets routes
  app.get('/api/datasets', async (req, res) => {
    try {
      const datasets = await storage.getDatasets();
      res.json(datasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      res.status(500).json({ message: 'Failed to fetch datasets' });
    }
  });
  
  app.get('/api/datasets/:id', async (req, res) => {
    try {
      const datasetId = parseInt(req.params.id);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset not found' });
      }
      
      res.json(dataset);
    } catch (error) {
      console.error('Error fetching dataset:', error);
      res.status(500).json({ message: 'Failed to fetch dataset' });
    }
  });
  
  app.post('/api/datasets', async (req, res) => {
    try {
      const result = insertDatasetSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid dataset data', errors: result.error.format() });
      }
      
      const dataset = await storage.createDataset(result.data);
      res.status(201).json(dataset);
    } catch (error) {
      console.error('Error creating dataset:', error);
      res.status(500).json({ message: 'Failed to create dataset' });
    }
  });
  
  // Dataset files routes
  app.get('/api/datasets/:id/files', async (req, res) => {
    try {
      const datasetId = parseInt(req.params.id);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const files = await storage.getDatasetFiles(datasetId);
      res.json(files);
    } catch (error) {
      console.error('Error fetching dataset files:', error);
      res.status(500).json({ message: 'Failed to fetch dataset files' });
    }
  });
  
  // Migration jobs routes
  app.get('/api/migrations', async (req, res) => {
    try {
      const migrations = await storage.getMigrationJobs();
      res.json(migrations);
    } catch (error) {
      console.error('Error fetching migration jobs:', error);
      res.status(500).json({ message: 'Failed to fetch migration jobs' });
    }
  });
  
  app.get('/api/migrations/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const migrations = await storage.getRecentMigrationJobs(limit);
      res.json(migrations);
    } catch (error) {
      console.error('Error fetching recent migration jobs:', error);
      res.status(500).json({ message: 'Failed to fetch recent migration jobs' });
    }
  });
  
  app.get('/api/migrations/:id', async (req, res) => {
    try {
      const migrationId = parseInt(req.params.id);
      if (isNaN(migrationId)) {
        return res.status(400).json({ message: 'Invalid migration ID' });
      }
      
      const migration = await storage.getMigrationJob(migrationId);
      if (!migration) {
        return res.status(404).json({ message: 'Migration job not found' });
      }
      
      res.json(migration);
    } catch (error) {
      console.error('Error fetching migration job:', error);
      res.status(500).json({ message: 'Failed to fetch migration job' });
    }
  });
  
  app.get('/api/migrations/:id/steps', async (req, res) => {
    try {
      const migrationId = parseInt(req.params.id);
      if (isNaN(migrationId)) {
        return res.status(400).json({ message: 'Invalid migration ID' });
      }
      
      const steps = await storage.getMigrationSteps(migrationId);
      res.json(steps);
    } catch (error) {
      console.error('Error fetching migration steps:', error);
      res.status(500).json({ message: 'Failed to fetch migration steps' });
    }
  });
  
  // Start a new migration
  app.post('/api/migrations', async (req, res) => {
    try {
      // Create schema for migration request
      const migrationRequestSchema = z.object({
        sourcePlatform: PlatformEnum,
        sourceUrl: z.string().url(),
        destinationPlatform: PlatformEnum,
        repositoryName: z.string().optional(),
        isPrivate: z.boolean().optional(),
        generateCard: z.boolean().optional(),
        validateSchema: z.boolean().optional(),
        runAnalysis: z.boolean().optional(),
        selectedFiles: z.array(z.string()).optional()
      });
      
      const result = migrationRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid migration request', errors: result.error.format() });
      }
      
      const { 
        sourcePlatform, 
        sourceUrl, 
        destinationPlatform,
        repositoryName,
        isPrivate,
        generateCard,
        validateSchema,
        runAnalysis,
        selectedFiles
      } = result.data;
      
      // Start the migration
      const migrationJob = await migrationService.startMigration(
        sourcePlatform,
        sourceUrl,
        destinationPlatform,
        {
          repositoryName,
          isPrivate,
          generateCard,
          validateSchema,
          runAnalysis,
          selectedFiles
        }
      );
      
      res.status(201).json(migrationJob);
    } catch (error) {
      console.error('Error starting migration:', error);
      res.status(500).json({ message: 'Failed to start migration', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Cancel a migration
  app.post('/api/migrations/:id/cancel', async (req, res) => {
    try {
      const migrationId = parseInt(req.params.id);
      if (isNaN(migrationId)) {
        return res.status(400).json({ message: 'Invalid migration ID' });
      }
      
      const migration = await storage.getMigrationJob(migrationId);
      if (!migration) {
        return res.status(404).json({ message: 'Migration job not found' });
      }
      
      if (migration.status === 'completed' || migration.status === 'failed') {
        return res.status(400).json({ message: `Cannot cancel migration in ${migration.status} state` });
      }
      
      // Update status to failed with cancellation message
      const updatedMigration = await storage.updateMigrationJobStatus(
        migrationId, 
        'failed', 
        'Migration cancelled by user'
      );
      
      res.json(updatedMigration);
    } catch (error) {
      console.error('Error cancelling migration:', error);
      res.status(500).json({ message: 'Failed to cancel migration' });
    }
  });
  
  // Analysis reports routes
  app.get('/api/datasets/:id/analysis', async (req, res) => {
    try {
      const datasetId = parseInt(req.params.id);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const reports = await storage.getAnalysisReports(datasetId);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching analysis reports:', error);
      res.status(500).json({ message: 'Failed to fetch analysis reports' });
    }
  });

  // Start a new analysis
  app.post('/api/datasets/:id/analyze', async (req, res) => {
    try {
      const datasetId = parseInt(req.params.id);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset not found' });
      }

      // Import the anthropic service
      const { analyzeDataset } = await import('./services/anthropic');
      
      // Get dataset files for analysis
      const files = await storage.getDatasetFiles(datasetId);
      
      // Get a sample of the dataset content
      // For a real app, you'd need to download and parse the actual files
      const sampleData = files.length > 0 
        ? `Sample of ${files.length} files:\n${files.map(f => `- ${f.name} (${f.type}, ${f.size} bytes)`).join('\n')}`
        : 'No files available for analysis';
      
      // Analyze the dataset using Claude
      const analysisResult = await analyzeDataset(
        dataset.name,
        dataset.description || '',
        dataset.metadata || {},
        sampleData
      );
      
      // Create a new analysis report
      const report = await storage.createAnalysisReport({
        datasetId,
        quality: analysisResult.quality,
        completeness: analysisResult.completeness,
        usability: analysisResult.usability,
        report: analysisResult,
        aiGenerated: true,
        createdAt: new Date()
      });
      
      res.status(201).json(report);
    } catch (error) {
      console.error('Error analyzing dataset:', error);
      res.status(500).json({ 
        message: 'Failed to analyze dataset', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Generate dataset card
  app.post('/api/datasets/:id/generate-card', async (req, res) => {
    try {
      const datasetId = parseInt(req.params.id);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: 'Invalid dataset ID' });
      }
      
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset not found' });
      }

      // Import the anthropic service
      const { generateDatasetCard } = await import('./services/anthropic');
      
      // Get the latest analysis report if available
      const reports = await storage.getAnalysisReports(datasetId);
      const latestReport = reports.length > 0 ? reports[0] : undefined;
      
      // Generate the dataset card using Claude
      const cardMarkdown = await generateDatasetCard(
        dataset.name,
        dataset.description || '',
        dataset.metadata || {},
        latestReport?.report
      );
      
      res.json({ markdown: cardMarkdown });
    } catch (error) {
      console.error('Error generating dataset card:', error);
      res.status(500).json({ 
        message: 'Failed to generate dataset card', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
