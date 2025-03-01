/**
 * Service for handling Kaggle authentication
 */

// Storage for Kaggle credentials
let kaggleCredentials: {
  username: string;
  key: string;
} | null = null;

/**
 * Set Kaggle API credentials
 * @param username Kaggle username
 * @param key Kaggle API key
 */
export function setKaggleCredentials(username: string, key: string): void {
  kaggleCredentials = { username, key };
  
  // In a real implementation, you would store these credentials securely
  // For example, in environment variables or a secure credential store
  
  // For demo purposes, we'll just set them in memory
  console.log(`Kaggle credentials set for user: ${username}`);
  
  // These should also be set as environment variables for the process
  process.env.KAGGLE_USERNAME = username;
  process.env.KAGGLE_KEY = key;
}

/**
 * Get Kaggle API credentials
 * @returns Kaggle credentials if set, null otherwise
 */
export function getKaggleCredentials(): { username: string; key: string } | null {
  return kaggleCredentials;
}

/**
 * Check if Kaggle credentials are set
 * @returns Whether Kaggle credentials are set
 */
export function hasKaggleCredentials(): boolean {
  return kaggleCredentials !== null;
}

/**
 * Clear Kaggle API credentials
 */
export function clearKaggleCredentials(): void {
  kaggleCredentials = null;
  delete process.env.KAGGLE_USERNAME;
  delete process.env.KAGGLE_KEY;
  console.log('Kaggle credentials cleared');
}

/**
 * Get Kaggle API headers for authenticated requests
 * @returns Headers object with authentication information
 */
export function getKaggleAuthHeaders(): Record<string, string> {
  if (!kaggleCredentials) {
    throw new Error('Kaggle credentials not set');
  }
  
  // Encode the credentials in Base64 for basic authentication
  const credentials = Buffer.from(`${kaggleCredentials.username}:${kaggleCredentials.key}`).toString('base64');
  
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Format kaggle.json for use with Kaggle API
 * @returns Content of kaggle.json file
 */
export function formatKaggleJson(): string {
  if (!kaggleCredentials) {
    throw new Error('Kaggle credentials not set');
  }
  
  return JSON.stringify({
    "username": kaggleCredentials.username,
    "key": kaggleCredentials.key
  }, null, 2);
}

/**
 * Generate python code for setting up Kaggle credentials
 * @returns Python code for setting up Kaggle credentials
 */
export function generateKaggleCredentialsCode(): string {
  if (!kaggleCredentials) {
    throw new Error('Kaggle credentials not set');
  }
  
  return `# Set up Kaggle credentials
import os
import json

# Create .kaggle directory if it doesn't exist
os.makedirs(os.path.expanduser('~/.kaggle'), exist_ok=True)

# Create kaggle.json file with API credentials
with open(os.path.expanduser('~/.kaggle/kaggle.json'), 'w') as f:
    json.dump({
        "username": "${kaggleCredentials.username}",
        "key": "${kaggleCredentials.key}"
    }, f)

# Set permissions on the file
os.chmod(os.path.expanduser('~/.kaggle/kaggle.json'), 0o600)

print("Kaggle credentials configured successfully!")
`;
}