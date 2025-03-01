import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
export { sql }; // Export the raw SQL client for direct queries

// Helper function to initialize the database
export async function initializeDatabase() {
  try {
    // Test connection
    const result = await sql`SELECT version()`;
    console.log("Database connected:", result[0].version);
    
    // Create tables if they don't exist
    await createTables();
    
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

// Create tables
async function createTables() {
  // Import schema from shared schema file
  const {
    users,
    datasets,
    migrationJobs,
    migrationSteps,
    datasetFiles,
    analysisReports,
  } = await import("@shared/schema");

  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      display_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Create datasets table
  await sql`
    CREATE TABLE IF NOT EXISTS datasets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      original_platform TEXT NOT NULL,
      original_url TEXT,
      current_platform TEXT NOT NULL,
      metadata JSONB,
      files_count INTEGER,
      total_size BIGINT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Create migration_jobs table
  await sql`
    CREATE TABLE IF NOT EXISTS migration_jobs (
      id SERIAL PRIMARY KEY,
      dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
      source_platform TEXT NOT NULL,
      source_url TEXT NOT NULL,
      destination_platform TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      progress INTEGER DEFAULT 0,
      options JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Create migration_steps table
  await sql`
    CREATE TABLE IF NOT EXISTS migration_steps (
      id SERIAL PRIMARY KEY,
      migration_job_id INTEGER REFERENCES migration_jobs(id) ON DELETE CASCADE,
      step_name TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      progress INTEGER DEFAULT 0,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE
    );
  `;

  // Create dataset_files table
  await sql`
    CREATE TABLE IF NOT EXISTS dataset_files (
      id SERIAL PRIMARY KEY,
      dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      size BIGINT,
      type TEXT,
      url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Create analysis_reports table
  await sql`
    CREATE TABLE IF NOT EXISTS analysis_reports (
      id SERIAL PRIMARY KEY,
      dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
      quality INTEGER,
      completeness INTEGER,
      usability INTEGER,
      report JSONB,
      ai_generated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}