import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

// Schema for Kaggle credentials
const kaggleCredentialsSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  key: z.string().min(1, { message: "API key is required" }),
});

type KaggleCredentials = z.infer<typeof kaggleCredentialsSchema>;

interface KaggleAuthProps {
  onAuthenticated?: () => void;
}

export default function KaggleAuth({ onAuthenticated }: KaggleAuthProps) {
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup form
  const form = useForm<KaggleCredentials>({
    resolver: zodResolver(kaggleCredentialsSchema),
    defaultValues: {
      username: "",
      key: "",
    },
  });

  // Check if already authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/kaggle/auth/status", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      return data.authenticated;
    } catch (error) {
      console.error("Error checking Kaggle auth status:", error);
      return false;
    }
  };

  // Call check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle form submission
  const onSubmit = async (data: KaggleCredentials) => {
    setAuthStatus("loading");
    try {
      const response = await fetch("/api/kaggle/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAuthStatus("success");
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Kaggle credentials authenticated successfully",
      });

      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (error) {
      console.error("Error authenticating with Kaggle:", error);
      setAuthStatus("error");
      toast({
        title: "Authentication Failed",
        description:
          "Could not authenticate with Kaggle using the provided credentials",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/kaggle/auth", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsAuthenticated(false);
      form.reset();
      toast({
        title: "Logged Out",
        description: "Your Kaggle credentials have been cleared",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Kaggle Authentication</CardTitle>
        <CardDescription>
          Provide your Kaggle credentials to authorize dataset operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <p className="text-sm font-medium">Authenticated with Kaggle</p>
              <p className="text-xs mt-1">
                Your credentials are securely stored for this session.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Clear Credentials
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
                disabled={authStatus === "loading"}
              >
                {authStatus === "loading"
                  ? "Authenticating..."
                  : "Authenticate"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-neutral-600">
        <p>You can find your Kaggle API key in your account settings.</p>
        <a
          href="https://www.kaggle.com/settings/account"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:underline mt-1"
        >
          Go to Kaggle Account Settings →
        </a>
      </CardFooter>
    </Card>
  );
}
