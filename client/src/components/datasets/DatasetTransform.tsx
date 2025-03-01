import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dataset } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { DatasetFile } from "@shared/schema";

// Types for transformations
enum TransformationType {
  REMOVE_COLUMN = "remove_column",
  RENAME_COLUMN = "rename_column",
  TRAIN_TEST_SPLIT = "train_test_split",
  SQL_QUERY = "sql_query",
}

interface Transformation {
  type: TransformationType;
  params: Record<string, any>;
}

// Schema for remove column form
const removeColumnSchema = z.object({
  columnName: z.string().min(1, { message: "Column name is required" }),
  fileName: z.string().min(1, { message: "File name is required" }),
});

// Schema for rename column form
const renameColumnSchema = z.object({
  oldName: z.string().min(1, { message: "Original column name is required" }),
  newName: z.string().min(1, { message: "New column name is required" }),
  fileName: z.string().min(1, { message: "File name is required" }),
});

// Schema for train/test split form
const trainTestSplitSchema = z.object({
  trainSize: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0.1).max(0.9)
  ),
  testSize: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0.1).max(0.9)
  ),
  fileName: z.string().min(1, { message: "File name is required" }),
});

// Schema for SQL query form
const sqlQuerySchema = z.object({
  query: z.string().min(1, { message: "SQL query is required" }),
  databaseFile: z.string().min(1, { message: "Database file is required" }),
});

interface DatasetTransformProps {
  dataset: Dataset;
  files: DatasetFile[];
}

export default function DatasetTransform({ dataset, files }: DatasetTransformProps) {
  const { toast } = useToast();
  const [transformType, setTransformType] = useState<TransformationType>(TransformationType.REMOVE_COLUMN);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Setup forms for each transformation type
  const removeColumnForm = useForm<z.infer<typeof removeColumnSchema>>({
    resolver: zodResolver(removeColumnSchema),
    defaultValues: {
      columnName: "",
      fileName: files.length > 0 ? files[0].name : "",
    },
  });

  const renameColumnForm = useForm<z.infer<typeof renameColumnSchema>>({
    resolver: zodResolver(renameColumnSchema),
    defaultValues: {
      oldName: "",
      newName: "",
      fileName: files.length > 0 ? files[0].name : "",
    },
  });

  const trainTestSplitForm = useForm<z.infer<typeof trainTestSplitSchema>>({
    resolver: zodResolver(trainTestSplitSchema),
    defaultValues: {
      trainSize: "0.8",
      testSize: "0.2",
      fileName: files.length > 0 ? files[0].name : "",
    },
  });

  const sqlQueryForm = useForm<z.infer<typeof sqlQuerySchema>>({
    resolver: zodResolver(sqlQuerySchema),
    defaultValues: {
      query: "SELECT * FROM table LIMIT 100",
      databaseFile: files.find(f => f.type === "sqlite" || f.name.endsWith(".db") || f.name.endsWith(".sqlite"))?.name || "",
    },
  });

  // Handle remove column submission
  const onRemoveColumnSubmit = async (data: z.infer<typeof removeColumnSchema>) => {
    const transformation: Transformation = {
      type: TransformationType.REMOVE_COLUMN,
      params: {
        columnName: data.columnName,
      },
    };

    await processTransformation([transformation], data.fileName);
  };

  // Handle rename column submission
  const onRenameColumnSubmit = async (data: z.infer<typeof renameColumnSchema>) => {
    const transformation: Transformation = {
      type: TransformationType.RENAME_COLUMN,
      params: {
        oldName: data.oldName,
        newName: data.newName,
      },
    };

    await processTransformation([transformation], data.fileName);
  };

  // Handle train/test split submission
  const onTrainTestSplitSubmit = async (data: z.infer<typeof trainTestSplitSchema>) => {
    const transformation: Transformation = {
      type: TransformationType.TRAIN_TEST_SPLIT,
      params: {
        trainSize: data.trainSize,
        testSize: data.testSize,
      },
    };

    await processTransformation([transformation], data.fileName);
  };

  // Handle SQL query submission
  const onSqlQuerySubmit = async (data: z.infer<typeof sqlQuerySchema>) => {
    const transformation: Transformation = {
      type: TransformationType.SQL_QUERY,
      params: {
        query: data.query,
        databaseFile: data.databaseFile,
      },
    };

    await processTransformation([transformation], data.databaseFile);
  };

  // Process transformation request
  const processTransformation = async (transformations: Transformation[], fileName: string) => {
    setIsProcessing(true);
    try {
      const response = await apiRequest<{ code: string }>({
        url: `/api/datasets/${dataset.id}/transform`,
        method: "POST",
        data: {
          transformations,
          fileName,
        },
      });

      setGeneratedCode(response.code);
      toast({
        title: "Transformation Generated",
        description: "Python code for dataset transformation has been generated",
      });
    } catch (error) {
      console.error("Error processing transformation:", error);
      toast({
        title: "Error",
        description: "Failed to process transformation request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Transformations</CardTitle>
          <CardDescription>
            Apply transformations to your Kaggle dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="remove_column" onValueChange={(value) => setTransformType(value as TransformationType)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="remove_column">Remove Column</TabsTrigger>
              <TabsTrigger value="rename_column">Rename Column</TabsTrigger>
              <TabsTrigger value="train_test_split">Train/Test Split</TabsTrigger>
              <TabsTrigger value="sql_query">SQL Query</TabsTrigger>
            </TabsList>

            <TabsContent value="remove_column">
              <Form {...removeColumnForm}>
                <form onSubmit={removeColumnForm.handleSubmit(onRemoveColumnSubmit)} className="space-y-4">
                  <FormField
                    control={removeColumnForm.control}
                    name="fileName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Name</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select file" />
                            </SelectTrigger>
                            <SelectContent>
                              {files.filter(f => 
                                f.type === "csv" || f.type === "parquet" || f.type === "json"
                              ).map((file) => (
                                <SelectItem key={file.id} value={file.name}>
                                  {file.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={removeColumnForm.control}
                    name="columnName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter column name to remove" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Remove Column"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="rename_column">
              <Form {...renameColumnForm}>
                <form onSubmit={renameColumnForm.handleSubmit(onRenameColumnSubmit)} className="space-y-4">
                  <FormField
                    control={renameColumnForm.control}
                    name="fileName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Name</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select file" />
                            </SelectTrigger>
                            <SelectContent>
                              {files.filter(f => 
                                f.type === "csv" || f.type === "parquet" || f.type === "json"
                              ).map((file) => (
                                <SelectItem key={file.id} value={file.name}>
                                  {file.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={renameColumnForm.control}
                      name="oldName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Column Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Original name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={renameColumnForm.control}
                      name="newName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Column Name</FormLabel>
                          <FormControl>
                            <Input placeholder="New name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Rename Column"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="train_test_split">
              <Form {...trainTestSplitForm}>
                <form onSubmit={trainTestSplitForm.handleSubmit(onTrainTestSplitSubmit)} className="space-y-4">
                  <FormField
                    control={trainTestSplitForm.control}
                    name="fileName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Name</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select file" />
                            </SelectTrigger>
                            <SelectContent>
                              {files.filter(f => 
                                f.type === "csv" || f.type === "parquet" || f.type === "json"
                              ).map((file) => (
                                <SelectItem key={file.id} value={file.name}>
                                  {file.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={trainTestSplitForm.control}
                      name="trainSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Train Size (0.1-0.9)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0.1" max="0.9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={trainTestSplitForm.control}
                      name="testSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Size (0.1-0.9)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0.1" max="0.9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Create Train/Test Split"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="sql_query">
              <Form {...sqlQueryForm}>
                <form onSubmit={sqlQueryForm.handleSubmit(onSqlQuerySubmit)} className="space-y-4">
                  <FormField
                    control={sqlQueryForm.control}
                    name="databaseFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Database File</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select database file" />
                            </SelectTrigger>
                            <SelectContent>
                              {files.filter(f => 
                                f.type === "sqlite" || f.name.endsWith(".db") || f.name.endsWith(".sqlite")
                              ).map((file) => (
                                <SelectItem key={file.id} value={file.name}>
                                  {file.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={sqlQueryForm.control}
                    name="query"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SQL Query</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="SELECT * FROM table LIMIT 100" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Execute SQL Query"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Python Code</CardTitle>
            <CardDescription>
              This code can be executed to transform your dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-neutral-100 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedCode)}>
              Copy to Clipboard
            </Button>
            <Button onClick={() => setGeneratedCode(null)}>
              Clear
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}