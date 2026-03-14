import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SessionPage from "./pages/SessionPage";
import PatientViewPage from "./pages/PatientViewPage";
import SubmittedPage from "./pages/SubmittedPage";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={SessionPage} />
      <Route path="/patient-view" component={PatientViewPage} />
      <Route path="/submitted" component={SubmittedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
