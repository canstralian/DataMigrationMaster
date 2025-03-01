import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Dataset } from "@shared/schema";
import DatasetCard from "@/components/datasets/DatasetCard";
import { ToggleButton } from "@/components/ui/toggle-button";

export default function Home() {
  const [_, navigate] = useLocation();
  const [tab, setTab] = useState("all");

  const {
    data: datasets,
    isLoading,
    error,
  } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  const handleMigrateDataset = (dataset: Dataset) => {
    navigate("/migration");
  };

  const handleAnalyzeDataset = (dataset: Dataset) => {
    navigate("/analysis");
  };

  const filteredDatasets = datasets?.filter((dataset) => {
    if (tab === "all") return true;
    return dataset.currentPlatform === tab;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dataset Hub</h1>
        <p className="text-neutral-600 max-w-3xl">
          Manage your datasets across GitHub, Kaggle, and Hugging Face Hub.
          Analyze repository metrics, validate against schema, and generate
          comprehensive reports.
        </p>
      </div>

      <ToggleButton
        options={[
          {
            value: "all",
            label: (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                All Datasets
              </div>
            ),
          },
          {
            value: "github",
            label: (
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="mr-2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </div>
            ),
          },
          {
            value: "kaggle",
            label: (
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M18.825 23.859c-.022.092-.097.141-.241.141h-3.131c-.157 0-.273-.045-.351-.134l-4.101-5.091-3.158 3.097c-.111.111-.222.156-.333.156H5.222c-.135 0-.202-.071-.202-.211 0-.063.022-.116.067-.158l5.354-5.217L5.374 9.227c-.056-.06-.078-.128-.078-.203 0-.13.068-.195.204-.195h3.186c.138 0 .25.05.335.151l4.467 5.516 3.002-2.956c.089-.09.2-.141.33-.141h2.285c.067 0 .121.023.162.068a.21.21 0 01.063.166c0 .057-.023.111-.068.162l-5.195 5.142 5.629 7.067c.034.045.051.1.051.166 0 .079-.059.159-.176.24" />
                </svg>
                Kaggle
              </div>
            ),
          },
          {
            value: "huggingface",
            label: (
              <div className="flex items-center">
                <svg
                  viewBox="0 0 120 120"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M90.75,14.97C73.09,3.50,49.94,6.89,36.14,23.52a44.14,44.14,0,0,0-1.82,59.42c.49.64,1,1.26,1.53,1.87a15.48,15.48,0,0,1-6.50-12.7c0-.21,0-.41,0-.62a14.9,14.9,0,0,1,4.71-10.85Zm2.6,67.72a15.43,15.43,0,0,1-8.56-6.53,44.12,44.12,0,0,0,8.32-50.38A33.82,33.82,0,0,1,105.2,43c.27.45.52.91.77,1.38a14.77,14.77,0,0,1-1.11,15.42L93.35,82.69ZM60,105a44.71,44.71,0,0,0,18.18-3.88A15.64,15.64,0,0,1,93.48,93a15.25,15.25,0,0,1-.49,3.57A33.75,33.75,0,0,1,60,105Z" />
                </svg>
                Hugging Face
              </div>
            ),
          },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
          ))
        ) : error ? (
          <div className="col-span-3 text-red-500 py-4">
            Failed to load datasets. Please try again.
          </div>
        ) : filteredDatasets && filteredDatasets.length > 0 ? (
          filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onMigrate={handleMigrateDataset}
              onAnalyze={handleAnalyzeDataset}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <h3 className="text-lg font-medium mb-2">No datasets found</h3>
            <p className="text-neutral-500 mb-4">
              Get started by importing a dataset or creating a new one
            </p>
            <button
              onClick={() => navigate("/migration")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary/90"
            >
              Import Dataset
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/migration")}
          >
            <div className="flex items-center mb-2 text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 7H7v6h6V7z" />
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="font-medium">Migrate Dataset</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Transfer datasets between GitHub, Kaggle, and Hugging Face Hub
            </p>
          </div>

          <div
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/analysis")}
          >
            <div className="flex items-center mb-2 text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="font-medium">Analyze Dataset</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Perform AI-powered analysis on your datasets
            </p>
          </div>

          <div
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/validation")}
          >
            <div className="flex items-center mb-2 text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="font-medium">Validate Dataset</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Check if your dataset matches expected schema structure
            </p>
          </div>

          <div
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/transform")}
          >
            <div className="flex items-center mb-2 text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="font-medium">Transform Dataset</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Apply transformations to your Kaggle datasets with Python
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
