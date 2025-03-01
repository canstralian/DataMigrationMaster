import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dataset, MigrationJob, Platform } from "@shared/schema";

import PlatformSelector from "@/components/datasets/PlatformSelector";
import SourceConfiguration from "@/components/datasets/SourceConfiguration";
import DestinationConfiguration from "@/components/datasets/DestinationConfiguration";
import MigrationProgress from "@/components/datasets/MigrationProgress";
import InfoPanel from "@/components/datasets/InfoPanel";
import RecentActivity from "@/components/datasets/RecentActivity";
import { ToggleButton } from "@/components/ui/toggle-button";

export default function Migration() {
  const { toast } = useToast();

  // State for migration form
  const [sourcePlatform, setSourcePlatform] = useState<Platform | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [folder, setFolder] = useState("");
  const [branch, setBranch] = useState("main");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Destination configuration
  const [destinationPlatform] = useState<Platform>("huggingface"); // Currently only supporting HF as destination
  const [repositoryName, setRepositoryName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [datasetType, setDatasetType] = useState("tabular");
  const [generateCard, setGenerateCard] = useState(true);
  const [validateSchema, setValidateSchema] = useState(false);
  const [runAnalysis, setRunAnalysis] = useState(false);

  // State for handling the active migration job
  const [activeMigrationId, setActiveMigrationId] = useState<number | null>(
    null,
  );
  const [showMigrationProgress, setShowMigrationProgress] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("migration");

  // Create migration mutation
  const migrationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/migrations", data),
    onSuccess: async (response) => {
      const migrationJob: MigrationJob = await response.json();
      setActiveMigrationId(migrationJob.id);
      setShowMigrationProgress(true);

      toast({
        title: "Migration Started",
        description: "Your dataset migration has been initiated.",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/migrations/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start migration. Please try again.",
        variant: "destructive",
      });
      console.error("Migration error:", error);
    },
  });

  // Handle migration submission
  const handleStartMigration = async () => {
    if (!sourcePlatform || !sourceUrl) {
      toast({
        title: "Validation Error",
        description: "Please select a source platform and enter a URL.",
        variant: "destructive",
      });
      return;
    }

    if (!repositoryName) {
      toast({
        title: "Validation Error",
        description: "Please enter a repository name for the destination.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      sourcePlatform,
      sourceUrl,
      destinationPlatform,
      repositoryName,
      isPrivate,
      generateCard,
      validateSchema,
      runAnalysis,
      selectedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
    };

    migrationMutation.mutate(data);
  };

  const handleSaveAsDraft = () => {
    toast({
      title: "Saved as Draft",
      description: "Your migration configuration has been saved as a draft.",
    });
  };

  const handleMigrationComplete = () => {
    toast({
      title: "Migration Completed",
      description: "Your dataset has been successfully migrated.",
    });

    // Reset form after some delay to allow user to see the completed state
    setTimeout(() => {
      setShowMigrationProgress(false);
      setActiveMigrationId(null);

      // Reset form fields
      setSourcePlatform(null);
      setSourceUrl("");
      setFolder("");
      setBranch("main");
      setSelectedFiles([]);
      setRepositoryName("");

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/migrations/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    }, 3000);
  };

  // Set repository name based on sourceUrl when it changes
  useEffect(() => {
    if (sourceUrl) {
      try {
        const url = new URL(sourceUrl);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          // For GitHub, use the repo name
          const repoName = pathParts[1]
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-");
          setRepositoryName(repoName);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
  }, [sourceUrl]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Dataset Migration & Analysis
        </h1>
        <p className="text-neutral-600 max-w-3xl">
          Migrate datasets between GitHub, Kaggle, and Hugging Face Hub. Analyze
          repository metrics, validate against schema, and generate
          comprehensive reports.
        </p>
      </div>

      <ToggleButton
        options={[
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
          {
            value: "schema",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Schema
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
        onChange={setActiveTab}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold mb-6">
              Dataset Migration Tool
            </h2>

            {!showMigrationProgress ? (
              <>
                <PlatformSelector
                  selectedPlatform={sourcePlatform}
                  onSelectPlatform={setSourcePlatform}
                />

                {sourcePlatform && (
                  <SourceConfiguration
                    platform={sourcePlatform}
                    sourceUrl={sourceUrl}
                    onUrlChange={setSourceUrl}
                    selectedFiles={selectedFiles}
                    onSelectedFilesChange={setSelectedFiles}
                    folder={folder}
                    onFolderChange={setFolder}
                    branch={branch}
                    onBranchChange={setBranch}
                  />
                )}

                {sourcePlatform && sourceUrl && (
                  <DestinationConfiguration
                    platform={destinationPlatform}
                    repositoryName={repositoryName}
                    onRepositoryNameChange={setRepositoryName}
                    isPrivate={isPrivate}
                    onIsPrivateChange={setIsPrivate}
                    datasetType={datasetType}
                    onDatasetTypeChange={setDatasetType}
                    generateCard={generateCard}
                    onGenerateCardChange={setGenerateCard}
                    validateSchema={validateSchema}
                    onValidateSchemaChange={setValidateSchema}
                    runAnalysis={runAnalysis}
                    onRunAnalysisChange={setRunAnalysis}
                  />
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAsDraft}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-text bg-neutral-200 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 mr-3"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleStartMigration}
                    disabled={
                      migrationMutation.isPending ||
                      !sourcePlatform ||
                      !sourceUrl ||
                      !repositoryName
                    }
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary ${
                      migrationMutation.isPending ||
                      !sourcePlatform ||
                      !sourceUrl ||
                      !repositoryName
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {migrationMutation.isPending
                      ? "Starting..."
                      : "Start Migration"}
                  </button>
                </div>
              </>
            ) : activeMigrationId ? (
              <MigrationProgress
                migrationId={activeMigrationId}
                onComplete={handleMigrationComplete}
              />
            ) : (
              <div className="text-center py-4">
                <p>
                  No active migration. Start a new migration to see progress.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <InfoPanel />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
