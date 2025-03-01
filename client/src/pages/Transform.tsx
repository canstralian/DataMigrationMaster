import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dataset, DatasetFile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KaggleAuth from "@/components/datasets/KaggleAuth";
import DatasetTransform from "@/components/datasets/DatasetTransform";

export default function Transform() {
  const [_, navigate] = useLocation();
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    null,
  );
  const [authStep, setAuthStep] = useState<"auth" | "transform">("auth");

  // Query to fetch datasets
  const { data: datasets, isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Query to fetch dataset files
  const { data: files, isLoading: filesLoading } = useQuery<DatasetFile[]>({
    queryKey: ["/api/datasets", selectedDatasetId, "files"],
    enabled: !!selectedDatasetId,
  });

  // Query to check Kaggle auth status
  const { data: authStatus, refetch: refetchAuthStatus } = useQuery<{
    authenticated: boolean;
  }>({
    queryKey: ["/api/kaggle/auth/status"],
  });

  // Effect to automatically move to transform step if already authenticated
  useEffect(() => {
    if (authStatus?.authenticated) {
      setAuthStep("transform");
    }
  }, [authStatus]);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(parseInt(datasetId));
  };

  const handleAuthSuccess = () => {
    setAuthStep("transform");
    refetchAuthStatus();
  };

  const selectedDataset = selectedDatasetId
    ? datasets?.find((d) => d.id === selectedDatasetId)
    : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          &larr; Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Dataset Transformations</h1>
        <p className="text-neutral-600 max-w-3xl">
          Apply transformations to your Kaggle datasets using Python code
          generation. You can remove columns, rename fields, split datasets, and
          run SQL queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Dataset
                  </label>
                  <Select
                    onValueChange={handleDatasetSelect}
                    disabled={datasetsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets?.map((dataset) => (
                        <SelectItem key={dataset.id} value={String(dataset.id)}>
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDataset && (
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedDataset.name}</h3>
                    {selectedDataset.description && (
                      <p className="text-sm text-neutral-600">
                        {selectedDataset.description}
                      </p>
                    )}
                    <div className="text-xs text-neutral-500">
                      <p>Platform: {selectedDataset.currentPlatform}</p>
                      <p>Files: {selectedDataset.filesCount || "Unknown"}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {authStep === "auth" ? (
            <KaggleAuth onAuthenticated={handleAuthSuccess} />
          ) : selectedDataset && files ? (
            <DatasetTransform dataset={selectedDataset} files={files} />
          ) : (
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <p className="text-neutral-600">
                {selectedDatasetId
                  ? "Loading dataset files..."
                  : "Select a dataset to start transforming"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
