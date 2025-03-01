import { useState } from 'react';
import { AnalysisReport } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  report: AnalysisReport;
  datasetId: number;
  onGenerateCard?: (markdown: string) => void;
}

// Type definitions for the report structure
interface ReportData {
  summary: string;
  metrics?: Record<string, any>;
  issues?: string[];
  recommendations?: string[];
}

export default function AnalysisResults({ report, datasetId, onGenerateCard }: AnalysisResultsProps) {
  const { toast } = useToast();
  const [generatingCard, setGeneratingCard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Parse the report data from JSON if it's a string
  const reportData: ReportData = typeof report.report === 'string' 
    ? JSON.parse(report.report) 
    : (report.report as unknown as ReportData) || { 
        summary: 'No summary available',
        metrics: {},
        issues: [],
        recommendations: []
      };

  const handleGenerateCard = async () => {
    setGeneratingCard(true);
    try {
      const response = await apiRequest('POST', `/api/datasets/${datasetId}/generate-card`, {});
      const data = await response.json();
      
      if (onGenerateCard) {
        onGenerateCard(data.markdown);
      }
      
      toast({
        title: "Dataset Card Generated",
        description: "The card has been successfully generated based on the analysis.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate dataset card.",
        variant: "destructive",
      });
    } finally {
      setGeneratingCard(false);
    }
  };

  const getQualityColor = (score: number | null) => {
    if (!score) return 'text-neutral-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatTime = (dateStr: string | Date | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dataset Analysis Results</CardTitle>
          <Badge variant={report.aiGenerated ? 'secondary' : 'outline'}>
            {report.aiGenerated ? 'AI Generated' : 'Manual Analysis'}
          </Badge>
        </div>
        <div className="text-sm text-neutral-500">
          Generated on {formatDate(report.createdAt)} {formatTime(report.createdAt)}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Quality Score</h4>
                    <div className={`text-3xl font-bold mb-2 ${getQualityColor(report.quality)}`}>
                      {report.quality ?? 0}/100
                    </div>
                    <Progress value={report.quality ?? 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Completeness</h4>
                    <div className={`text-3xl font-bold mb-2 ${getQualityColor(report.completeness)}`}>
                      {report.completeness ?? 0}/100
                    </div>
                    <Progress value={report.completeness ?? 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Usability</h4>
                    <div className={`text-3xl font-bold mb-2 ${getQualityColor(report.usability)}`}>
                      {report.usability ?? 0}/100
                    </div>
                    <Progress value={report.usability ?? 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-neutral-700">
                {reportData.summary || 'No summary available'}
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateCard} 
                disabled={generatingCard}
                variant="secondary"
              >
                {generatingCard ? 'Generating...' : 'Generate Dataset Card'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {reportData.metrics && Object.keys(reportData.metrics).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(reportData.metrics).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    {typeof value === 'object' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                          <div key={subKey} className="bg-neutral-50 p-2 rounded-md">
                            <div className="text-xs text-neutral-500">{subKey}</div>
                            <div className="font-medium">{String(subValue)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{String(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-neutral-50 rounded-lg text-center">
                No detailed metrics available for this report
              </div>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Issues</h3>
                {reportData.issues && reportData.issues.length > 0 ? (
                  <ul className="space-y-2">
                    {reportData.issues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500">No issues detected</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                {reportData.recommendations && reportData.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {reportData.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500">No recommendations available</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}