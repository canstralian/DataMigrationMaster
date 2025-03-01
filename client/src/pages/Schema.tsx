import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleButton } from "@/components/ui/toggle-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Schema() {
  const [activeTab, setActiveTab] = useState("schema");
  const [activeSchemaTab, setActiveSchemaTab] = useState("builder");
  
  // State for the schema builder
  const [fields, setFields] = useState([
    { name: "id", type: "number", required: true },
    { name: "name", type: "string", required: true },
    { name: "description", type: "string", required: false }
  ]);
  
  // Generated schema based on the fields
  const generatedSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": fields.reduce((acc, field) => {
      acc[field.name] = { "type": field.type };
      return acc;
    }, {}),
    "required": fields.filter(f => f.required).map(f => f.name)
  };

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "string", required: false }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: { name: string, type: string, required: boolean }) => {
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dataset Schema Management</h1>
        <p className="text-neutral-600 max-w-3xl">
          Define, manage, and share schemas for your datasets to ensure consistency and compatibility.
        </p>
      </div>

      <ToggleButton
        options={[
          {
            value: "schema",
            label: (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Schema
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
          }
        ]}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schema Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeSchemaTab} onValueChange={setActiveSchemaTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="yaml">YAML</TabsTrigger>
              </TabsList>
              
              <TabsContent value="builder">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Schema Fields</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {fields.map((field, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-center">
                            <div className="col-span-4">
                              <Label htmlFor={`field-name-${index}`} className="mb-1 block">Field Name</Label>
                              <Input 
                                id={`field-name-${index}`}
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, { ...field, name: e.target.value })}
                                placeholder="e.g. first_name"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label htmlFor={`field-type-${index}`} className="mb-1 block">Type</Label>
                              <Select 
                                value={field.type}
                                onValueChange={(value) => handleFieldChange(index, { ...field, type: value })}
                              >
                                <SelectTrigger id={`field-type-${index}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="integer">Integer</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3">
                              <div className="flex items-center h-full mt-6">
                                <Switch 
                                  id={`field-required-${index}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) => handleFieldChange(index, { ...field, required: checked })}
                                />
                                <Label htmlFor={`field-required-${index}`} className="ml-2">
                                  Required
                                </Label>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveField(index)}
                                className="mt-6"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <Button onClick={handleAddField} className="mt-2">
                          Add Field
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline">Save as Template</Button>
                    <div className="space-x-2">
                      <Button variant="outline">Reset</Button>
                      <Button variant="secondary">Generate Schema</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="json">
                <div className="bg-neutral-50 p-4 rounded-md font-mono text-sm overflow-auto h-96 whitespace-pre">
                  {JSON.stringify(generatedSchema, null, 2)}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" className="mr-2">Copy</Button>
                  <Button variant="secondary">Download JSON</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="yaml">
                <div className="bg-neutral-50 p-4 rounded-md font-mono text-sm overflow-auto h-96 whitespace-pre">
                  {`# YAML representation of your schema
$schema: http://json-schema.org/draft-07/schema#
type: object
properties:
${fields.map(field => `  ${field.name}:\n    type: ${field.type}`).join('\n')}
required:
${fields.filter(f => f.required).map(field => `  - ${field.name}`).join('\n')}
`}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" className="mr-2">Copy</Button>
                  <Button variant="secondary">Download YAML</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schema Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-neutral-50 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Tabular Data (CSV)</h3>
                  <p className="text-sm text-neutral-500 mb-4">Schema template for common CSV tabular data formats.</p>
                  <div className="text-xs text-neutral-400">Last modified: 3 days ago</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-neutral-50 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">JSON Document</h3>
                  <p className="text-sm text-neutral-500 mb-4">Schema template for nested JSON document structures.</p>
                  <div className="text-xs text-neutral-400">Last modified: 1 week ago</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-neutral-50 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Image Metadata</h3>
                  <p className="text-sm text-neutral-500 mb-4">Schema template for image dataset with metadata.</p>
                  <div className="text-xs text-neutral-400">Last modified: 2 weeks ago</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
