import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dataset, AnalysisReport, MigrationJob } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DatasetCardProps {
  dataset: Dataset;
  reports?: AnalysisReport[];
  migrations?: MigrationJob[];
  onMigrate?: (dataset: Dataset) => void;
  onAnalyze?: (dataset: Dataset) => void;
  onView?: (dataset: Dataset) => void;
}

export default function DatasetCard({
  dataset,
  reports,
  migrations,
  onMigrate,
  onAnalyze,
  onView,
}: DatasetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasActiveMigration = migrations?.some(
    (m) => m.status === "in_progress",
  );
  const lastMigration = migrations?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const getDatasetMetrics = () => {
    const latestReport = reports?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

    if (!latestReport) return null;

    return (
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="bg-neutral-50 p-3 rounded-md">
          <div className="text-neutral-500 mb-1">Quality</div>
          <div className="text-lg font-semibold">
            {latestReport.quality}/100
          </div>
          <Progress value={latestReport.quality} className="h-1 mt-1" />
        </div>
        <div className="bg-neutral-50 p-3 rounded-md">
          <div className="text-neutral-500 mb-1">Completeness</div>
          <div className="text-lg font-semibold">
            {latestReport.completeness}/100
          </div>
          <Progress value={latestReport.completeness} className="h-1 mt-1" />
        </div>
        <div className="bg-neutral-50 p-3 rounded-md">
          <div className="text-neutral-500 mb-1">Usability</div>
          <div className="text-lg font-semibold">
            {latestReport.usability}/100
          </div>
          <Progress value={latestReport.usability} className="h-1 mt-1" />
        </div>
      </div>
    );
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "github":
        return (
          <Badge variant="outline" className="bg-neutral-100">
            GitHub
          </Badge>
        );
      case "kaggle":
        return (
          <Badge variant="outline" className="bg-blue-100">
            Kaggle
          </Badge>
        );
      case "huggingface":
        return (
          <Badge variant="outline" className="bg-primary/20">
            Hugging Face
          </Badge>
        );
      default:
        return <Badge variant="outline">{platform}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{dataset.name}</CardTitle>
          {getPlatformBadge(dataset.currentPlatform)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {dataset.description || "No description available"}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mb-2">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            {dataset.filesCount || 0} files
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
                clipRule="evenodd"
              />
            </svg>
            {formatBytes(dataset.totalSize)}
          </div>
          {dataset.metadata?.license && (
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {dataset.metadata.license}
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            <div className="border-t border-neutral-200 my-2 pt-2">
              <div className="mb-1 font-medium text-sm">Migration History</div>
              {migrations && migrations.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {migrations.slice(0, 3).map((migration) => (
                    <div key={migration.id} className="flex justify-between">
                      <div className="flex items-center">
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${
                            migration.status === "completed"
                              ? "bg-accent"
                              : migration.status === "in_progress"
                                ? "bg-secondary"
                                : "bg-red-500"
                          }`}
                        ></span>
                        {migration.sourcePlatform} →{" "}
                        {migration.destinationPlatform}
                      </div>
                      <div className="text-neutral-500 text-xs">
                        {formatDistanceToNow(new Date(migration.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  No migration history found
                </div>
              )}
            </div>

            {getDatasetMetrics()}
          </>
        )}

        {hasActiveMigration && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Migration in progress</span>
              <span>{lastMigration?.progress}%</span>
            </div>
            <Progress value={lastMigration?.progress} className="h-1" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
        <div className="space-x-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(dataset)}>
              View
            </Button>
          )}
          {onAnalyze && !hasActiveMigration && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAnalyze(dataset)}
            >
              Analyze
            </Button>
          )}
          {onMigrate && !hasActiveMigration && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onMigrate(dataset)}
            >
              Migrate
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
