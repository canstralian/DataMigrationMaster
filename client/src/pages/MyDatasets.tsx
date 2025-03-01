import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dataset, MigrationJob, AnalysisReport } from "@shared/schema";
import { ToggleButton } from "@/components/ui/toggle-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatasetCard from "@/components/datasets/DatasetCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function MyDatasets() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("my-datasets");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all datasets
  const {
    data: datasets,
    isLoading: isLoadingDatasets,
    error: datasetsError,
  } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Fetch all migrations to map to datasets
  const { data: migrations } = useQuery<MigrationJob[]>({
    queryKey: ["/api/migrations"],
  });

  // Fetch all analysis reports
  const { data: analysisReports } = useQuery<AnalysisReport[]>({
    queryKey: ["/api/datasets/analysis"],
  });

  // Delete dataset mutation
  const deleteMutation = useMutation({
    mutationFn: (datasetId: number) =>
      apiRequest("DELETE", `/api/datasets/${datasetId}`, {}),
    onSuccess: () => {
      toast({
        title: "Dataset Deleted",
        description: "The dataset has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete dataset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle dataset operations
  const handleMigrateDataset = (dataset: Dataset) => {
    navigate("/migration");
  };

  const handleAnalyzeDataset = (dataset: Dataset) => {
    navigate("/analysis");
  };

  const handleViewDataset = (dataset: Dataset) => {
    // For demo, we'll just show a toast
    toast({
      title: "View Dataset",
      description: `Viewing details for ${dataset.name}`,
    });
  };

  // Filter and sort datasets
  const filteredDatasets = datasets
    ?.filter((dataset) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dataset.description &&
          dataset.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Apply platform filter
      const matchesPlatform =
        platformFilter === "all" || dataset.currentPlatform === platformFilter;

      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // Get migrations for a specific dataset
  const getDatasetMigrations = (datasetId: number) => {
    return (
      migrations?.filter((migration) => migration.datasetId === datasetId) || []
    );
  };

  // Get analysis reports for a specific dataset
  const getDatasetReports = (datasetId: number) => {
    return (
      analysisReports?.filter((report) => report.datasetId === datasetId) || []
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Datasets</h1>
        <p className="text-neutral-600 max-w-3xl">
          Manage, analyze, and migrate your datasets across GitHub, Kaggle, and
          Hugging Face Hub.
        </p>
      </div>

      <ToggleButton
        options={[
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
        ]}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={platformFilter}
                  onValueChange={setPlatformFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="kaggle">Kaggle</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate("/migration")}>
                Import New Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoadingDatasets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 h-64 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-5 bg-neutral-200 rounded w-16"></div>
                <div className="h-5 bg-neutral-200 rounded w-16"></div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <div className="h-8 bg-neutral-200 rounded w-16"></div>
                <div className="h-8 bg-neutral-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : datasetsError ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          Failed to load datasets. Please try refreshing the page.
        </div>
      ) : filteredDatasets && filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              migrations={getDatasetMigrations(dataset.id)}
              reports={getDatasetReports(dataset.id)}
              onMigrate={handleMigrateDataset}
              onAnalyze={handleAnalyzeDataset}
              onView={handleViewDataset}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-neutral-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-neutral-300 mb-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-xl font-medium mb-2">No datasets found</h3>
          {searchQuery || platformFilter !== "all" ? (
            <p className="text-neutral-500 mb-4">
              No datasets match your current filters. Try adjusting your search
              criteria.
            </p>
          ) : (
            <p className="text-neutral-500 mb-4">
              You haven't imported any datasets yet. Get started by importing a
              dataset.
            </p>
          )}
          <Button onClick={() => navigate("/migration")}>Import Dataset</Button>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold mb-6">
          Migration & Analysis History
        </h2>

        {migrations && migrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Dataset
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Operation
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {migrations.slice(0, 5).map((migration) => {
                  const relatedDataset = datasets?.find(
                    (d) => d.id === migration.datasetId,
                  );

                  return (
                    <tr key={migration.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {relatedDataset?.name ||
                          `Dataset #${migration.datasetId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        Migration: {migration.sourcePlatform} →{" "}
                        {migration.destinationPlatform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            migration.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : migration.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {migration.status === "completed"
                            ? "Completed"
                            : migration.status === "in_progress"
                              ? "In Progress"
                              : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(migration.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {migrations.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All History
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-500">
            No migration or analysis history available
          </div>
        )}
      </div>
    </div>
  );
}
