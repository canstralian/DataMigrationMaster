import { Platform, PlatformEnum } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { HuggingFaceSVG, GitHubIcon, KaggleIcon } from "@/components/ui/icons";

interface PlatformSelectorProps {
  selectedPlatform: Platform | null;
  onSelectPlatform: (platform: Platform) => void;
}

export default function PlatformSelector({ 
  selectedPlatform, 
  onSelectPlatform 
}: PlatformSelectorProps) {
  
  const platforms = [
    {
      id: "github",
      name: "GitHub",
      icon: GitHubIcon,
      description: "Migrate datasets from GitHub repositories",
      color: "bg-blue-700"
    },
    {
      id: "kaggle",
      name: "Kaggle",
      icon: KaggleIcon,
      description: "Migrate datasets from Kaggle",
      color: "bg-cyan-600"
    },
    {
      id: "huggingface",
      name: "Hugging Face",
      icon: HuggingFaceSVG,
      description: "Migrate datasets from Hugging Face Dataset Hub",
      color: "bg-emerald-600"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {platforms.map((platform) => {
        const isSelected = selectedPlatform === platform.id;
        const Icon = platform.icon;
        
        return (
          <Card 
            key={platform.id}
            className={`border-2 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? `border-${platform.color.split('-')[1]}-500` : 'border-transparent'
            }`}
            onClick={() => onSelectPlatform(platform.id as Platform)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${platform.color} text-white rounded-full flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium mb-1">{platform.name}</h3>
                <p className="text-sm text-neutral-500">{platform.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}