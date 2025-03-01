import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Migration from "@/pages/Migration";
import Analysis from "@/pages/Analysis";
import Validation from "@/pages/Validation";
import Schema from "@/pages/Schema";
import MyDatasets from "@/pages/MyDatasets";
import Transform from "@/pages/Transform";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Main application routes */}
      <Route path="/" component={Home} />
      <Route path="/migration" component={Migration} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/validation" component={Validation} />
      <Route path="/schema" component={Schema} />
      <Route path="/my-datasets" component={MyDatasets} />
      <Route path="/transform" component={Transform} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
