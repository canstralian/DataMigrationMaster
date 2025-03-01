import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MigrationJob, MigrationStep } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface MigrationProgressProps {
  migrationId: number;
  onComplete?: () => void;
}

// Extended MigrationJob interface to include optional fields used in this component
interface ExtendedMigrationJob extends MigrationJob {
  totalFiles?: number;
  currentStep?: string;
}

export default function MigrationProgress({ migrationId, onComplete }: MigrationProgressProps) {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch the migration job
  const { data: migrationJob, isLoading: isLoadingJob } = useQuery<ExtendedMigrationJob>({
    queryKey: [`/api/migrations/${migrationId}`],
    refetchInterval: autoRefresh ? 3000 : false,
  });

  // Fetch the migration steps
  const { data: migrationSteps, isLoading: isLoadingSteps } = useQuery<MigrationStep[]>({
    queryKey: [`/api/migrations/${migrationId}/steps`],
    refetchInterval: autoRefresh ? 3000 : false,
  });

  // Auto-disable the refresh when the migration is completed or failed
  useEffect(() => {
    if (migrationJob && (migrationJob.status === 'completed' || migrationJob.status === 'failed')) {
      setAutoRefresh(false);
      
      if (migrationJob.status === 'completed' && onComplete) {
        onComplete();
      }
      
      if (migrationJob.status === 'completed') {
        toast({
          title: 'Migration Completed',
          description: 'Your dataset has been successfully migrated.',
        });
      } else if (migrationJob.status === 'failed') {
        toast({
          title: 'Migration Failed',
          description: migrationJob.error || 'An error occurred during migration.',
          variant: 'destructive',
        });
      }
    }
  }, [migrationJob, onComplete, toast]);

  // When clicking refresh button manually
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/migrations/${migrationId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/migrations/${migrationId}/steps`] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-neutral-200';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-neutral-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeElapsed = (startTime: string | Date | null) => {
    if (!startTime) return '0m 0s';
    
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = now - start;
    
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (dateTime: string | Date | null) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Migration Progress</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={autoRefresh} 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button 
              variant={autoRefresh ? 'secondary' : 'outline'} 
              size="sm" 
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingJob ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-6 bg-neutral-200 rounded"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
          </div>
        ) : migrationJob ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Status</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(migrationJob.status)}`}></div>
                  <span className="font-medium">
                    {migrationJob.status === 'in_progress' ? 'In Progress' : 
                     migrationJob.status === 'completed' ? 'Completed' : 
                     migrationJob.status === 'failed' ? 'Failed' : 
                     'Pending'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Progress</h3>
                <span className="font-medium">{migrationJob.progress ?? 0}%</span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Files</h3>
                <span className="font-medium">{migrationJob.totalFiles || '0'} files</span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Time Elapsed</h3>
                <span className="font-medium">
                  {formatTimeElapsed(migrationJob.createdAt)}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{migrationJob.progress ?? 0}% Complete</span>
                {migrationJob.status === 'in_progress' && (
                  <span className="text-neutral-500">
                    {migrationJob.currentStep || 'Processing...'}
                  </span>
                )}
              </div>
              <Progress 
                value={migrationJob.progress ?? 0} 
                className={`h-2 ${
                  migrationJob.status === 'failed' 
                    ? 'bg-red-100' 
                    : migrationJob.status === 'completed' 
                      ? 'bg-green-100' 
                      : 'bg-neutral-100'
                }`}
              />
            </div>
            
            {migrationJob.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <p className="font-medium mb-1">Error:</p>
                <p>{migrationJob.error}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-md font-medium mb-2">Migration Steps</h3>
              {isLoadingSteps ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              ) : migrationSteps && migrationSteps.length > 0 ? (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-3">
                    {migrationSteps.map((step) => (
                      <div 
                        key={step.id}
                        className="p-3 border rounded-md relative"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">{step.name}</div>
                          <div>{getStatusBadge(step.status)}</div>
                        </div>
                        <div className="text-sm text-neutral-600 line-clamp-2">
                          {step.message || 'No details available'}
                        </div>
                        
                        {step.status === 'in_progress' && (
                          <div className="mt-2">
                            <Progress value={step.progress ?? 0} className="h-1" />
                          </div>
                        )}
                        
                        <div className="text-xs text-neutral-500 mt-1">
                          {formatTime(step.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-md">
                  <p className="text-neutral-500">No migration steps found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">
              Migration details not found. The migration may have been deleted.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}