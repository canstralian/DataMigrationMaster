import { useState, useEffect } from 'react';
import { Platform } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SourceConfigurationProps {
  platform: Platform;
  sourceUrl: string;
  onUrlChange: (url: string) => void;
  selectedFiles: string[];
  onSelectedFilesChange: (files: string[]) => void;
  folder?: string;
  onFolderChange: (folder: string) => void;
  branch?: string;
  onBranchChange: (branch: string) => void;
}

interface File {
  id: number;
  datasetId: number;
  name: string;
  path: string;
  size: number;
  type: string;
  selected: boolean;
}

export default function SourceConfiguration({
  platform,
  sourceUrl,
  onUrlChange,
  selectedFiles,
  onSelectedFilesChange,
  folder = '',
  onFolderChange,
  branch = '',
  onBranchChange
}: SourceConfigurationProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [urlInputValue, setUrlInputValue] = useState(sourceUrl);
  const [folderInputValue, setFolderInputValue] = useState(folder);
  const [branchInputValue, setBranchInputValue] = useState(branch);

  const fetchFiles = async () => {
    if (!sourceUrl) return;
    
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (folder) queryParams.append('folder', folder);
      if (branch) queryParams.append('branch', branch);
      
      const response = await apiRequest(
        'GET', 
        `/api/platforms/${platform}/files?url=${encodeURIComponent(sourceUrl)}&${queryParams.toString()}`
      );
      
      const data = await response.json();
      setFiles(data.map((file: any) => ({ ...file, selected: selectedFiles.includes(file.path) })));
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch files from ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch files when platform, url, folder or branch changes
  useEffect(() => {
    if (sourceUrl) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [platform, sourceUrl, folder, branch]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlChange(urlInputValue);
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFolderChange(folderInputValue);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBranchChange(branchInputValue);
  };

  const toggleFileSelection = (path: string) => {
    const newFiles = files.map(file => 
      file.path === path ? { ...file, selected: !file.selected } : file
    );
    setFiles(newFiles);
    
    const newSelectedFiles = newFiles
      .filter(file => file.selected)
      .map(file => file.path);
    
    onSelectedFilesChange(newSelectedFiles);
  };

  const toggleAllFiles = (selected: boolean) => {
    const newFiles = files.map(file => ({ ...file, selected }));
    setFiles(newFiles);
    
    const newSelectedFiles = selected ? newFiles.map(file => file.path) : [];
    onSelectedFilesChange(newSelectedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  let placeholderText = '';
  switch (platform) {
    case 'github':
      placeholderText = 'https://github.com/username/repository';
      break;
    case 'kaggle':
      placeholderText = 'https://www.kaggle.com/datasets/username/dataset-name';
      break;
    case 'huggingface':
      placeholderText = 'https://huggingface.co/datasets/username/dataset-name';
      break;
  }

  const showFolderInput = platform === 'github';
  const showBranchInput = platform === 'github';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-url">
              {platform === 'github' ? 'Repository URL' : 'Dataset URL'}
            </Label>
            <div className="flex space-x-2">
              <Input
                id="source-url"
                placeholder={placeholderText}
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                {sourceUrl ? 'Refresh' : 'Load'}
              </Button>
            </div>
          </div>
        </form>

        {showFolderInput && (
          <form onSubmit={handleFolderSubmit} className="space-y-2">
            <Label htmlFor="folder-path">
              Folder Path (Optional)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="folder-path"
                placeholder="data/datasets"
                value={folderInputValue}
                onChange={(e) => setFolderInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Apply
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Specify a subfolder to only migrate files from that directory
            </p>
          </form>
        )}

        {showBranchInput && (
          <form onSubmit={handleBranchSubmit} className="space-y-2">
            <Label htmlFor="branch-name">
              Branch (Optional)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="branch-name"
                placeholder="main"
                value={branchInputValue}
                onChange={(e) => setBranchInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Apply
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              By default, files from the main branch are shown
            </p>
          </form>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Files</h3>
            {files.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="text-xs text-neutral-500">
                  {files.filter(f => f.selected).length} of {files.length} selected
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleAllFiles(true)}
                    disabled={isLoading}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleAllFiles(false)}
                    disabled={isLoading}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center py-2">
                  <div className="w-5 h-5 bg-neutral-200 rounded-sm mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : files.length > 0 ? (
            <ScrollArea className="h-[300px] border rounded-md">
              <div className="p-4 space-y-2">
                {files.map((file) => (
                  <div 
                    key={file.path} 
                    className="flex items-start py-2 hover:bg-neutral-50 rounded px-2 cursor-pointer"
                    onClick={() => toggleFileSelection(file.path)}
                  >
                    <Checkbox 
                      checked={file.selected}
                      onCheckedChange={() => toggleFileSelection(file.path)}
                      className="mr-3 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-neutral-500 flex space-x-2">
                        <span>{file.path}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : sourceUrl ? (
            <div className="text-center py-8 bg-neutral-50 rounded-md">
              <p className="text-neutral-500">No files found. Try changing the source URL or folder.</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-neutral-50 rounded-md">
              <p className="text-neutral-500">Enter a URL and click Load to see files</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}