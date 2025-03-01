import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dataset, AnalysisReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ToggleButton } from "@/components/ui/toggle-button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AnalysisResults from "@/components/datasets/AnalysisResults";
import DatasetCardPreview from "@/components/datasets/DatasetCardPreview";

export default function Analysis() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("analysis");
  const [cardMarkdown, setCardMarkdown] = useState<string | null>(null);

  // Fetch all datasets
  const { data: datasets, isLoading: isLoadingDatasets } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Fetch analysis reports for the selected dataset
  const { data: analysisReports, isLoading: isLoadingReports } = useQuery<
    AnalysisReport[]
  >({
    queryKey: [`/api/datasets/${selectedDatasetId}/analysis`],
    enabled: !!selectedDatasetId,
  });

  // Create the analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: (datasetId: number) =>
      apiRequest("POST", `/api/datasets/${datasetId}/analyze`, {}),
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "AI analysis of your dataset has been initiated.",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/datasets/${selectedDatasetId}/analysis`],
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to start dataset analysis.",
        variant: "destructive",
      });
    },
  });

  const handleStartAnalysis = () => {
    if (selectedDatasetId) {
      analyzeMutation.mutate(selectedDatasetId);
    } else {
      toast({
        title: "No Dataset Selected",
        description: "Please select a dataset to analyze.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "migration") {
      navigate("/migration");
    } else if (tab === "validation") {
      navigate("/validation");
    } else if (tab === "my-datasets") {
      navigate("/my-datasets");
    }
  };

  const handleGenerateCard = (markdown: string) => {
    setCardMarkdown(markdown);
  };

  const handleDownloadCard = () => {
    if (!cardMarkdown) return;

    const blob = new Blob([cardMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedDataset = datasets?.find((d) => d.id === selectedDatasetId);
  const latestReport = analysisReports?.[0];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dataset Analysis</h1>
        <p className="text-neutral-600 max-w-3xl">
          Analyze your datasets using AI-powered tools. Get insights into data
          quality, completeness, and usability.
        </p>
      </div>

      <ToggleButton
        options={[
          {
            value: "analysis",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Analysis
              </div>
            ),
          },
          {
            value: "migration",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Migration
              </div>
            ),
          },
          {
            value: "validation",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                Validation
              </div>
            ),
          },
          {
            value: "my-datasets",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                My Datasets
              </div>
            ),
          },
        ]}
        value={activeTab}
        onChange={handleTabChange}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDatasets ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              ) : datasets && datasets.length > 0 ? (
                <div className="space-y-2">
                  {datasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => {
                        setSelectedDatasetId(dataset.id);
                        setCardMarkdown(null);
                      }}
                      className={`w-full text-left p-2 rounded-md text-sm ${
                        selectedDatasetId === dataset.id
                          ? "bg-secondary text-white"
                          : "hover:bg-neutral-100"
                      }`}
                    >
                      <div className="font-medium line-clamp-1">
                        {dataset.name}
                      </div>
                      <div className="text-xs opacity-80 line-clamp-1">
                        {dataset.filesCount || 0} files •{" "}
                        {dataset.currentPlatform}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  No datasets available
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={!selectedDatasetId || analyzeMutation.isPending}
                  onClick={handleStartAnalysis}
                >
                  {analyzeMutation.isPending
                    ? "Analyzing..."
                    : "Analyze Dataset"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          {cardMarkdown ? (
            <DatasetCardPreview
              markdown={cardMarkdown}
              onEdit={(newMarkdown) => setCardMarkdown(newMarkdown)}
              onDownload={handleDownloadCard}
            />
          ) : selectedDataset ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Analysis: {selectedDataset.name}</CardTitle>
                  <Badge>{selectedDataset.currentPlatform}</Badge>
                </div>
                <p className="text-sm text-neutral-500">
                  {selectedDataset.description || "No description available"}
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-200 rounded"></div>
                    <div className="h-4 bg-neutral-200 rounded"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-neutral-200 rounded"></div>
                      <div className="h-24 bg-neutral-200 rounded"></div>
                      <div className="h-24 bg-neutral-200 rounded"></div>
                    </div>
                  </div>v>
                ) : latestReport ? (
                  <AnalysisResults
                    report={latestReport}
                    datasetId={selectedDataset.id}
                    onGenerateCard={handleGenerateCard}
                  />
                ) : (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-neutral-300 mb-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">
                      No Analysis Reports
                    </h3>
                    <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                      This dataset hasn't been analyzed yet. Run an analysis to
                      get insights about data quality, completeness, and
                      usability.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handleStartAnalysis}
                      disabled={analyzeMutation.isPending}
                    >
                      {analyzeMutation.isPending
                        ? "Analyzing..."
                        : "Start Analysis"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 p-6 h-full flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-neutral-300 mb-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <h3 className="text-xl font-medium mb-2">Select a Dataset</h3>
              <p className="text-neutral-500 text-center max-w-md mb-4">
                Select a dataset from the sidebar to view its analysis or to run
                a new analysis using our AI-powered tools.
              </p>
              <p className="text-sm text-neutral-400">
                Dataset analysis provides insights on quality, completeness, and
                usability metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
