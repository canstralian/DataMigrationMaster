import { DatasetFile } from "@shared/schema";

export interface HuggingFaceDataset {
  id: string;
  author: string;
  description: string;
  citation: string;
  license: string;
  tags: string[];
  downloads: number;
  lastModified: string;
  paperswithcode_id: string;
  size_categories: string[];
}

export interface HuggingFaceFile {
  name: string;
  path: string;
  size: number;
  type: string;
  lastCommit: string;
}

/**
 * Extracts dataset ID from a Hugging Face dataset URL
 * @param datasetUrl Hugging Face dataset URL
 * @returns Dataset ID (owner/dataset)
 */
function extractDatasetId(datasetUrl: string): string {
  // e.g., https://huggingface.co/datasets/username/dataset-name
  const urlPattern = /huggingface\.co\/(?:datasets\/)?([^\/]+)\/([^\/\?]+)/;
  const match = datasetUrl.match(urlPattern);

  if (!match) {
    throw new Error("Invalid Hugging Face dataset URL");
  }

  return `${match[1]}/${match[2]}`;
}

/**
 * Fetches dataset information from Hugging Face
 * @param datasetUrl Hugging Face dataset URL
 * @returns Dataset information
 */
export async function getDatasetInfo(
  datasetUrl: string,
): Promise<HuggingFaceDataset> {
  try {
    const datasetId = extractDatasetId(datasetUrl);
    const response = await fetch(
      `https://huggingface.co/api/datasets/${datasetId}`,
    );

    if (!response.ok) {
      throw new Error(
        `Hugging Face API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Hugging Face dataset:", error);

    // Return mock data when API fails
    const datasetId = extractDatasetId(datasetUrl);
    const [author, name] = datasetId.split("/");

    return {
      id: datasetId,
      author,
      description: "Dataset description unavailable",
      citation: "",
      license: "Unknown",
      tags: [],
      downloads: 0,
      lastModified: new Date().toISOString(),
      paperswithcode_id: "",
      size_categories: ["unknown"],
    };
  }
}

/**
 * Lists files in a Hugging Face dataset
 * @param datasetUrl Hugging Face dataset URL
 * @returns List of files
 */
export async function listDatasetFiles(
  datasetUrl: string,
): Promise<HuggingFaceFile[]> {
  try {
    const datasetId = extractDatasetId(datasetUrl);
    const response = await fetch(
      `https://huggingface.co/api/datasets/${datasetId}/tree/main`,
    );

    if (!response.ok) {
      throw new Error(
        `Hugging Face API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data.map((file: any) => ({
      name: file.path.split("/").pop(),
      path: file.path,
      size: file.size || 0,
      type: file.type,
      lastCommit: file.lastCommit?.date || "",
    }));
  } catch (error) {
    console.error("Error listing Hugging Face dataset files:", error);

    // Return mock data when API fails
    return [
      {
        name: "dataset_infos.json",
        path: "dataset_infos.json",
        size: 5000,
        type: "blob",
        lastCommit: new Date().toISOString(),
      },
      {
        name: "README.md",
        path: "README.md",
        size: 15000,
        type: "blob",
        lastCommit: new Date().toISOString(),
      },
      {
        name: "data",
        path: "data",
        size: 0,
        type: "tree",
        lastCommit: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Creates a new dataset on Hugging Face Hub
 * @param name Dataset name
 * @param isPrivate Whether the dataset is private
 * @param token Hugging Face API token
 * @returns Created dataset URL
 */
export async function createDataset(
  name: string,
  isPrivate: boolean = false,
  token: string = process.env.HUGGINGFACE_TOKEN || "",
): Promise<string> {
  // Note: In a real implementation, this would use the Hugging Face API
  // For demo purposes, we're just returning a constructed URL

  // The URL would typically include the user's username
  const username = "username"; // This would come from the authenticated user

  return `https://huggingface.co/datasets/${username}/${name}`;
}

/**
 * Uploads a file to a Hugging Face dataset
 * @param datasetId Hugging Face dataset ID (owner/dataset)
 * @param filePath Path where the file should be stored
 * @param content File content
 * @param token Hugging Face API token
 * @returns Success boolean
 */
export async function uploadFile(
  datasetId: string,
  filePath: string,
  content: string,
  token: string = process.env.HUGGINGFACE_TOKEN || "",
): Promise<boolean> {
  // Note: In a real implementation, this would use the Hugging Face API
  console.log(`Uploading ${filePath} to dataset ${datasetId}`);

  // For demo purposes, we're just returning true
  return true;
}

/**
 * Converts Hugging Face files to dataset files format
 * @param hfFiles Files from Hugging Face
 * @param datasetId Dataset ID
 * @returns Dataset files
 */
export function convertToDatasetFiles(
  hfFiles: HuggingFaceFile[],
  datasetId: number,
): DatasetFile[] {
  return hfFiles
    .filter((file) => file.type === "blob") // Only include actual files, not directories
    .map((file) => ({
      id: 0, // Will be assigned by storage
      datasetId,
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.name.split(".").pop() || "",
      selected: true,
      createdAt: new Date(),
    }));
}

/**
 * Downloads a file from Hugging Face
 * @param datasetId Hugging Face dataset ID (owner/dataset)
 * @param filePath Path of the file to download
 * @returns File content
 */
export async function downloadFile(
  datasetId: string,
  filePath: string,
): Promise<string> {
  try {
    const response = await fetch(
      `https://huggingface.co/datasets/${datasetId}/resolve/main/${filePath}`,
    );

    if (!response.ok) {
      throw new Error(
        `Hugging Face download error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.text();
  } catch (error) {
    console.error("Error downloading file from Hugging Face:", error);
    throw error;
  }
}
