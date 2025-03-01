import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user table kept for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the Platform enum for the source/destination of datasets
export const PlatformEnum = z.enum(["github", "kaggle", "huggingface"]);
export type Platform = z.infer<typeof PlatformEnum>;

// Define the status enum for migration jobs
export const MigrationStatusEnum = z.enum([
  "pending", 
  "in_progress", 
  "completed", 
  "failed"
]);
export type MigrationStatus = z.infer<typeof MigrationStatusEnum>;

// Dataset table to track datasets across platforms
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  originalPlatform: text("original_platform").notNull(),
  currentPlatform: text("current_platform").notNull(),
  originalUrl: text("original_url"),
  currentUrl: text("current_url"),
  filesCount: integer("files_count"),
  totalSize: integer("total_size"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDatasetSchema = createInsertSchema(datasets)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;

// Migration jobs table to track dataset migrations
export const migrationJobs = pgTable("migration_jobs", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id"),
  sourcePlatform: text("source_platform").notNull(),
  destinationPlatform: text("destination_platform").notNull(),
  sourceUrl: text("source_url"),
  destinationUrl: text("destination_url"),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").default(0),
  error: text("error"),
  generateCard: boolean("generate_card").default(false),
  validateSchema: boolean("validate_schema").default(false),
  runAnalysis: boolean("run_analysis").default(false),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMigrationJobSchema = createInsertSchema(migrationJobs)
  .omit({ id: true, progress: true, error: true, startedAt: true, completedAt: true, createdAt: true });

export type InsertMigrationJob = z.infer<typeof insertMigrationJobSchema>;
export type MigrationJob = typeof migrationJobs.$inferSelect;

// Migration steps table to track individual steps in a migration
export const migrationSteps = pgTable("migration_steps", {
  id: serial("id").primaryKey(),
  migrationJobId: integer("migration_job_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").default(0),
  message: text("message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMigrationStepSchema = createInsertSchema(migrationSteps)
  .omit({ id: true, progress: true, message: true, startedAt: true, completedAt: true, createdAt: true });

export type InsertMigrationStep = z.infer<typeof insertMigrationStepSchema>;
export type MigrationStep = typeof migrationSteps.$inferSelect;

// Dataset files table to track files in a dataset
export const datasetFiles = pgTable("dataset_files", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size"),
  type: text("type"),
  selected: boolean("selected").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDatasetFileSchema = createInsertSchema(datasetFiles)
  .omit({ id: true, createdAt: true });

export type InsertDatasetFile = z.infer<typeof insertDatasetFileSchema>;
export type DatasetFile = typeof datasetFiles.$inferSelect;

// Analysis reports table to store dataset analysis results
export const analysisReports = pgTable("analysis_reports", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull(),
  quality: integer("quality"), // 0-100 score
  completeness: integer("completeness"), // 0-100 score
  usability: integer("usability"), // 0-100 score
  report: jsonb("report"), // Full report data
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisReportSchema = createInsertSchema(analysisReports)
  .omit({ id: true, createdAt: true });

export type InsertAnalysisReport = z.infer<typeof insertAnalysisReportSchema>;
export type AnalysisReport = typeof analysisReports.$inferSelect;
