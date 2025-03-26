import { Switch, Route, RouteComponentProps } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TransactionsPage from "@/pages/transactions-page";
import AccountsPage from "@/pages/accounts-page";
import BudgetPage from "@/pages/budget-page";
import InvestmentPage from "@/pages/investment-page";
import MessagePage from "@/pages/message-page";
import SettingsPage from "@/pages/settings-page";
import TermsPage from "@/pages/terms-page";
import OnboardingPage from "@/pages/onboarding-page";
import ConfigParserPage from "@/pages/config-parser-page";
import GeminiAnalysisPage from "@/pages/gemini-analysis";
import GeminiPydanticPage from "@/pages/gemini-pydantic-page";
import ApiTesterPage from "@/pages/api-tester";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/accounts" component={AccountsPage} />
      <ProtectedRoute path="/budget" component={BudgetPage} />
      <ProtectedRoute path="/investment" component={InvestmentPage} />
      <ProtectedRoute path="/messages" component={MessagePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/config-parser" component={ConfigParserPage} />
      <ProtectedRoute path="/gemini-analysis" component={GeminiAnalysisPage} />
      <ProtectedRoute path="/gemini-pydantic" component={GeminiPydanticPage} />
      <ProtectedRoute path="/api-tester" component={ApiTesterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
