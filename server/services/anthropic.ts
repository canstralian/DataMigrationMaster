import Anthropic from "@anthropic-ai/sdk";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL_NAME = "claude-3-7-sonnet-20250219";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key", // Fallback for development
});

export interface DatasetAnalysisResult {
  summary: string;
  quality: number; // 0-100
  completeness: number; // 0-100
  usability: number; // 0-100
  issues: string[];
  recommendations: string[];
  metrics: Record<string, any>;
}

// Fallback analysis result when API is unavailable
export const fallbackAnalysisResult: DatasetAnalysisResult = {
  summary: "This is a placeholder analysis generated because the Anthropic API was unavailable.",
  quality: 50,
  completeness: 50,
  usability: 50,
  issues: [
    "API credit balance is too low to perform a complete analysis",
    "Some dataset fields may be missing or incomplete"
  ],
  recommendations: [
    "Consider adding an Anthropic API key with sufficient credits",
    "Review the dataset manually for completeness and quality"
  ],
  metrics: {
    estimated_size: "Unknown",
    fields_count: "Unknown"
  }
};

/**
 * Analyzes a dataset using Claude AI
 * @param datasetName Name of the dataset
 * @param description Description of the dataset
 * @param metadata Additional metadata about the dataset
 * @param sampleData Sample data from the dataset (limited to a reasonable size)
 * @returns Analysis results
 */
export async function analyzeDataset(
  datasetName: string,
  description: string,
  metadata: Record<string, any>,
  sampleData: string,
): Promise<DatasetAnalysisResult> {
  try {
    const prompt = `
      Please analyze this dataset and provide a detailed assessment:
      
      Dataset Name: ${datasetName}
      Description: ${description}
      Metadata: ${JSON.stringify(metadata, null, 2)}
      
      Sample Data:
      ${sampleData}
      
      Please provide a JSON response with the following structure:
      {
        "summary": "A brief summary of the dataset and its potential applications",
        "quality": 80, // A score from 0-100 indicating overall data quality
        "completeness": 85, // A score from 0-100 indicating data completeness
        "usability": 75, // A score from 0-100 indicating how usable this data is
        "issues": ["Issue 1", "Issue 2"], // List any data quality issues found
        "recommendations": ["Recommendation 1", "Recommendation 2"], // Suggest improvements
        "metrics": {
          // Any relevant metrics extracted from the sample data
          // This will vary based on dataset type
        }
      }
    `;

    try {
      const response = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      // Extract the JSON from the response
      const content = response.content[0].text;
      const jsonMatch =
        content.match(/```json\n([\s\S]*)\n```/) || content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr) as DatasetAnalysisResult;
      }

      throw new Error("Could not parse JSON from Claude response");
    } catch (error) {
      console.error("Error analyzing dataset:", error);
      
      // Check if error is related to API credits
      if (error instanceof Error && 
          error.message.includes("credit balance is too low")) {
        console.log("Using fallback analysis due to insufficient API credits");
        return fallbackAnalysisResult;
      }
      
      // Default fallback for other errors
      return {
        summary: "Failed to analyze dataset",
        quality: 0,
        completeness: 0,
        usability: 0,
        issues: ["Analysis failed"],
        recommendations: ["Try again with a smaller sample"],
        metrics: {},
      };
    }
}

/**
 * Generates a dataset card markdown for Hugging Face
 * @param datasetName Name of the dataset
 * @param description Description of the dataset
 * @param metadata Additional metadata about the dataset
 * @param analysis Analysis results if available
 * @returns Markdown content for README.md
 */
export async function generateDatasetCard(
  datasetName: string,
  description: string,
  metadata: Record<string, any>,
  analysis?: DatasetAnalysisResult,
): Promise<string> {
  try {
    const prompt = `
      Please create a comprehensive dataset card for the Hugging Face Hub. This will be used as a README.md file.
      
      Dataset Name: ${datasetName}
      Description: ${description}
      Metadata: ${JSON.stringify(metadata, null, 2)}
      ${analysis ? `Analysis: ${JSON.stringify(analysis, null, 2)}` : ""}
      
      Follow the format of high-quality Hugging Face dataset cards, including:
      - Dataset summary
      - Supported tasks and leaderboards
      - Languages (if applicable)
      - Dataset structure
      - Data instances
      - Dataset creation
      - Considerations for using the data
      - Additional information
      
      Use YAML metadata tags at the beginning that match Hugging Face's format.
    `;

    const response = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Error generating dataset card:", error);

    // Fallback dataset card if the API fails
    return `---
datasets:
- ${datasetName.toLowerCase().replace(/ /g, "-")}
language:
- ${metadata.language || "en"}
license: ${metadata.license || "unknown"}
---

# Dataset Card for ${datasetName}

## Dataset Description

${description}

### Dataset Summary

A dataset for ${metadata.categories?.join(", ") || "various applications"}.

## Dataset Structure

### Data Instances

[More Information Needed]

### Dataset Fields

[More Information Needed]

### Dataset Creation

[More Information Needed]

## Considerations for Using the Data

### License

${metadata.license || "License information not provided."}

## Additional Information

This dataset card was automatically generated.
`;
  }
}
