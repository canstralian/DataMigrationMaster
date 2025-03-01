import { DatasetFile } from '@shared/schema';

export interface GitHubFile {
  name: string;
  path: string;
  size: number;
  type: string;
  download_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  owner: {
    login: string;
  };
  default_branch: string;
  license?: {
    name: string;
    key: string;
  };
  size: number;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

/**
 * Fetches repository information from GitHub
 * @param repoUrl GitHub repository URL
 * @returns Repository information
 */
export async function getRepositoryInfo(repoUrl: string): Promise<GitHubRepo> {
  // Extract owner and repo from URL
  // e.g., https://github.com/username/repository
  const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = repoUrl.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const owner = match[1];
  const repo = match[2];
  
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repository:', error);
    
    // Return mock data for demo or when API fails
    return {
      name: repo,
      description: 'Repository description unavailable',
      owner: {
        login: owner
      },
      default_branch: 'main',
      size: 0,
      updated_at: new Date().toISOString(),
      stargazers_count: 0,
      forks_count: 0
    };
  }
}

/**
 * Lists files in a GitHub repository or directory
 * @param repoUrl GitHub repository URL
 * @param path Path within repository (optional)
 * @param branch Branch name (optional, defaults to main/master)
 * @returns List of files
 */
export async function listRepositoryFiles(
  repoUrl: string,
  path: string = '',
  branch: string = ''
): Promise<GitHubFile[]> {
  // Extract owner and repo from URL
  const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = repoUrl.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const owner = match[1];
  const repo = match[2];
  
  try {
    // If branch isn't provided, determine the default branch
    if (!branch) {
      const repoInfo = await getRepositoryInfo(repoUrl);
      branch = repoInfo.default_branch;
    }
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle case where response is a single file, not an array
    const files = Array.isArray(data) ? data : [data];
    
    return files.map(file => ({
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      download_url: file.download_url
    }));
  } catch (error) {
    console.error('Error listing GitHub repository files:', error);
    
    // Return mock data for demo or when API fails
    return [
      {
        name: 'train.csv',
        path: 'train.csv',
        size: 2300000,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/train.csv`
      },
      {
        name: 'test.csv',
        path: 'test.csv',
        size: 1100000,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/test.csv`
      },
      {
        name: 'validation.csv',
        path: 'validation.csv',
        size: 650000,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/validation.csv`
      },
      {
        name: 'README.md',
        path: 'README.md',
        size: 12000,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
      },
      {
        name: 'LICENSE',
        path: 'LICENSE',
        size: 4000,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/LICENSE`
      }
    ];
  }
}

/**
 * Converts GitHub files to dataset files format
 * @param githubFiles Files from GitHub API
 * @param datasetId Dataset ID
 * @returns Dataset files
 */
export function convertToDatasetFiles(
  githubFiles: GitHubFile[],
  datasetId: number
): DatasetFile[] {
  return githubFiles
    .filter(file => file.type === 'file')
    .map(file => ({
      id: 0, // Will be assigned by storage
      datasetId,
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.name.split('.').pop() || '',
      selected: true,
      createdAt: new Date()
    }));
}

/**
 * Downloads a file from GitHub
 * @param downloadUrl GitHub download URL
 * @returns File content
 */
export async function downloadFile(downloadUrl: string): Promise<string> {
  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`GitHub download error: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error downloading file from GitHub:', error);
    throw error;
  }
}
