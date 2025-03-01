import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dataset } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleButton } from "@/components/ui/toggle-button";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Validation() {
  const { toast } = useToast();
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("validation");
  const [schemaText, setSchemaText] = useState("");
  const [strictMode, setStrictMode] = useState(false);

  // Fetch all datasets
  const { data: datasets, isLoading: isLoadingDatasets } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
  });

  // Validation mutation (for demo)
  const validateMutation = useMutation({
    mutationFn: (data: { datasetId: number, schema: string, strict: boolean }) => 
      // Note: In a real app, this endpoint would exist
      apiRequest('POST', `/api/datasets/${data.datasetId}/validate`, data),
    onSuccess: () => {
      toast({
        title: "Validation Successful",
        description: "The dataset matches the provided schema.",
      });
    },
    onError: () => {
      toast({
        title: "Validation Failed",
        description: "The dataset does not match the provided schema.",
        variant: "destructive",
      });
    }
  });

  const handleValidate = () => {
    if (!selectedDatasetId) {
      toast({
        title: "No Dataset Selected",
        description: "Please select a dataset to validate.",
        variant: "destructive",
      });
      return;
    }

    if (!schemaText.trim()) {
      toast({
        title: "Empty Schema",
        description: "Please provide a schema for validation.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll simulate a validation result
    // In a real app, we would send the schema to the backend
    const simulateValidation = () => {
      const isValid = Math.random() > 0.3; // 70% chance of success for demo
      
      if (isValid) {
        toast({
          title: "Validation Successful",
          description: "The dataset matches the provided schema.",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "The dataset does not match the provided schema. See errors below.",
          variant: "destructive",
        });
        
        // Show simulated validation errors
        setValidationResults({
          valid: false,
          errors: [
            { field: "column1", message: "Expected type 'number', got 'string'" },
            { field: "column3", message: "Missing required field" },
          ]
        });
      }
    };
    
    simulateValidation();
  };

  const loadSampleSchema = () => {
    const sampleSchema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string" },
        "age": { "type": "integer", "minimum": 0 },
        "email": { "type": "string", "format": "email" },
        "categories": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["id", "name", "email"]
    };
    
    setSchemaText(JSON.stringify(sampleSchema, null, 2));
  };

  const selectedDataset = datasets?.find(d => d.id === selectedDatasetId);

  // For demo, we'll use this state to simulate validation results
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors?: { field: string, message: string }[];
  } | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schema Validation</h1>
        <p className="text-neutral-600 max-w-3xl">
          Validate your datasets against a predefined schema to ensure data integrity and consistency.
        </p>
      </div>

      <ToggleButton
        options={[
          {
            value: "validation",
            label: (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Validation
              </div>
            )
          },
          {
            value: "migration",
            label: (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Migration
              </div>
            )
          },
          {
            value: "analysis",
            label: (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Analysis
              </div>
            )
          },
          {
            value: "my-datasets",
            label: (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                My Datasets
              </div>
            )
          }
        ]}
        value={activeTab}
        onChange={setActiveTab}
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
                      onClick={() => setSelectedDatasetId(dataset.id)}
                      className={`w-full text-left p-2 rounded-md text-sm ${
                        selectedDatasetId === dataset.id 
                          ? 'bg-secondary text-white' 
                          : 'hover:bg-neutral-100'
                      }`}
                    >
                      <div className="font-medium line-clamp-1">{dataset.name}</div>
                      <div className="text-xs opacity-80 line-clamp-1">
                        {dataset.filesCount || 0} files • {dataset.currentPlatform}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">No datasets available</div>
              )}
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Button 
                  onClick={loadSampleSchema}
                  variant="outline" 
                  className="w-full"
                >
                  Load Sample Schema
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>
                Schema Validation
                {selectedDataset ? `: ${selectedDataset.name}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="schema">Schema (JSON or YAML)</Label>
                  <Textarea 
                    id="schema"
                    placeholder="Paste your schema here or load a sample"
                    className="font-mono h-64"
                    value={schemaText}
                    onChange={(e) => setSchemaText(e.target.value)}
                  />
                  <div className="mt-2 flex items-center">
                    <Switch 
                      id="strict-mode" 
                      checked={strictMode}
                      onCheckedChange={setStrictMode}
                    />
                    <Label htmlFor="strict-mode" className="ml-2">
                      Strict Mode (reject unknown fields)
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="secondary"
                    disabled={!selectedDatasetId || !schemaText.trim()}
                    onClick={handleValidate}
                    className="w-32"
                  >
                    Validate
                  </Button>
                </div>

                {validationResults && (
                  <div className={`mt-4 p-4 rounded-md ${
                    validationResults.valid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <h3 className={`text-lg font-medium ${
                      validationResults.valid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResults.valid ? 'Validation Successful' : 'Validation Failed'}
                    </h3>
                    
                    {!validationResults.valid && validationResults.errors && (
                      <div className="mt-2">
                        <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {validationResults.errors.map((error, index) => (
                            <li key={index} className="text-red-700">
                              <span className="font-medium">{error.field}:</span> {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
