import { Platform } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HuggingFaceSVG, GitHubIcon, KaggleIcon } from "@/components/ui/icons";

interface DestinationConfigurationProps {
  platform: Platform;
  repositoryName: string;
  onRepositoryNameChange: (name: string) => void;
  isPrivate: boolean;
  onIsPrivateChange: (isPrivate: boolean) => void;
  datasetType: string;
  onDatasetTypeChange: (type: string) => void;
  generateCard: boolean;
  onGenerateCardChange: (generate: boolean) => void;
  validateSchema: boolean;
  onValidateSchemaChange: (validate: boolean) => void;
  runAnalysis: boolean;
  onRunAnalysisChange: (run: boolean) => void;
}

export default function DestinationConfiguration({
  platform,
  repositoryName,
  onRepositoryNameChange,
  isPrivate,
  onIsPrivateChange,
  datasetType,
  onDatasetTypeChange,
  generateCard,
  onGenerateCardChange,
  validateSchema,
  onValidateSchemaChange,
  runAnalysis,
  onRunAnalysisChange,
}: DestinationConfigurationProps) {
  let PlatformIcon;
  switch (platform) {
    case "github":
      PlatformIcon = GitHubIcon;
      break;
    case "kaggle":
      PlatformIcon = KaggleIcon;
      break;
    case "huggingface":
      PlatformIcon = HuggingFaceSVG;
      break;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PlatformIcon className="w-5 h-5" />
          <CardTitle>Destination Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repository-name">
            {platform === "github"
              ? "Repository Name"
              : platform === "kaggle"
                ? "Dataset Name"
                : "Dataset ID"}
          </Label>
          <Input
            id="repository-name"
            placeholder={
              platform === "github"
                ? "my-awesome-dataset"
                : platform === "kaggle"
                  ? "awesome-dataset"
                  : "username/awesome-dataset"
            }
            value={repositoryName}
            onChange={(e) => onRepositoryNameChange(e.target.value)}
          />
          <p className="text-xs text-neutral-500">
            {platform === "github"
              ? "This will create a new repository in your GitHub account"
              : platform === "kaggle"
                ? "This will create a new dataset in your Kaggle account"
                : 'For Hugging Face, use the format "username/dataset-name"'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is-private" className="block mb-1">
              {platform === "github" ? "Private Repository" : "Private Dataset"}
            </Label>
            <p className="text-xs text-neutral-500">
              {isPrivate
                ? "Only you will have access to this dataset"
                : "Everyone will be able to access this dataset"}
            </p>
          </div>
          <Switch
            id="is-private"
            checked={isPrivate}
            onCheckedChange={onIsPrivateChange}
          />
        </div>

        {platform === "huggingface" && (
          <div className="space-y-2">
            <Label htmlFor="dataset-type">Dataset Type</Label>
            <Select value={datasetType} onValueChange={onDatasetTypeChange}>
              <SelectTrigger id="dataset-type">
                <SelectValue placeholder="Select dataset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generic">Generic</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="tabular">Tabular</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500">
              This helps Hugging Face optimize the dataset preview and
              discoverability
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="generate-card" className="block mb-1">
              Generate Dataset Card
            </Label>
            <p className="text-xs text-neutral-500">
              Use AI to create a comprehensive README.md with documentation
            </p>
          </div>
          <Switch
            id="generate-card"
            checked={generateCard}
            onCheckedChange={onGenerateCardChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="validate-schema" className="block mb-1">
              Validate Schema
            </Label>
            <p className="text-xs text-neutral-500">
              Check dataset structure and consistency before migration
            </p>
          </div>
          <Switch
            id="validate-schema"
            checked={validateSchema}
            onCheckedChange={onValidateSchemaChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="run-analysis" className="block mb-1">
              Run Analysis
            </Label>
            <p className="text-xs text-neutral-500">
              Analyze dataset quality and generate insights using AI
            </p>
          </div>
          <Switch
            id="run-analysis"
            checked={runAnalysis}
            onCheckedChange={onRunAnalysisChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
