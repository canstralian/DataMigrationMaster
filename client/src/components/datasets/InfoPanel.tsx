import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HuggingFaceSVG, GitHubIcon, KaggleIcon } from '@/components/ui/icons';

export default function InfoPanel() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">How Dataset Migration Works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Select Source Platform</h3>
              <p className="text-xs text-neutral-600">Choose from GitHub, Kaggle, or Hugging Face repositories</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Enter Repository URL</h3>
              <p className="text-xs text-neutral-600">Choose specific files or folders to include in migration</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Configure Destination</h3>
              <p className="text-xs text-neutral-600">Specify metadata, visibility, and analysis options</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">AI-Powered Enhancements</h3>
              <p className="text-xs text-neutral-600">Optional schema validation and README.md generation</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-2">
          <h3 className="text-sm font-medium mb-2">Supported Platforms</h3>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-700 text-white rounded-lg flex items-center justify-center">
                <GitHubIcon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1">GitHub</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-cyan-600 text-white rounded-lg flex items-center justify-center">
                <KaggleIcon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1">Kaggle</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                <HuggingFaceSVG className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1">Hugging Face</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}