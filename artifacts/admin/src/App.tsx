import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewsPage from "@/pages/News";
import ActivitiesPage from "@/pages/Activities";
import TeachersPage from "@/pages/Teachers";
import StudentsPage from "@/pages/Students";
import ContactsPage from "@/pages/Contacts";
import SettingsPage from "@/pages/Settings";
import ResultsPage from "@/pages/Results";
import StandardsPage from "@/pages/Standards";
import AdminWorkPage from "@/pages/AdminWork";
import ReportsPage from "@/pages/Reports";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});

function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/news" component={NewsPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/teachers" component={TeachersPage} />
        <Route path="/students" component={StudentsPage} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/standards" component={StandardsPage} />
        <Route path="/admin-work" component={AdminWorkPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ProtectedApp />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
