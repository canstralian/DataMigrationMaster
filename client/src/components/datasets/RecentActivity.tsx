import { useQuery } from "@tanstack/react-query";
import { MigrationJob } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HuggingFaceSVG, GitHubIcon, KaggleIcon } from "@/components/ui/icons";

export default function RecentActivity() {
  // Fetch recent migration jobs
  const { data: recentMigrations, isLoading } = useQuery<MigrationJob[]>({
    queryKey: ["/api/migrations/recent"],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <GitHubIcon className="w-4 h-4" />;
      case "kaggle":
        return <KaggleIcon className="w-4 h-4" />;
      case "huggingface":
        return <HuggingFaceSVG className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMigrationTitle = (migration: MigrationJob) => {
    const sourceParts = migration.sourceUrl?.split("/") || [];
    const source =
      sourceParts.length >= 2
        ? sourceParts[sourceParts.length - 2] +
          "/" +
          sourceParts[sourceParts.length - 1]
        : migration.sourceUrl;
    return source || "Untitled Migration";
  };

  const getMigrationDescription = (migration: MigrationJob) => {
    return `${migration.sourcePlatform} → ${migration.destinationPlatform} • ${formatTimeAgo(migration.createdAt)}`;
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Unknown time";

    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs} sec ago`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentMigrations && recentMigrations.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentMigrations.map((migration) => (
                <div key={migration.id} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      migration.sourcePlatform === "github"
                        ? "bg-blue-100 text-blue-700"
                        : migration.sourcePlatform === "kaggle"
                          ? "bg-cyan-100 text-cyan-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {getPlatformIcon(migration.sourcePlatform)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">
                        {getMigrationTitle(migration)}
                      </div>
                      <div>{getStatusBadge(migration.status)}</div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {getMigrationDescription(migration)}
                    </div>

                    {migration.progress !== null &&
                      migration.progress > 0 &&
                      migration.progress < 100 && (
                        <div className="w-full mt-2 bg-neutral-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${migration.progress}%` }}
                          ></div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded-md">
            <p className="text-neutral-500">No recent activity</p>
            <p className="text-xs text-neutral-400 mt-1">
              Start a migration to see it here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
