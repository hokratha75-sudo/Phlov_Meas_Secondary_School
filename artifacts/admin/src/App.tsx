import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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
import TelegramInbox from "@/pages/TelegramInbox";
import SettingsPage from "@/pages/Settings";
import GradesPage from "@/pages/Grades";
import AdminWorkPage from "@/pages/AdminWork";
import ReportsPage from "@/pages/Reports";
import DocumentsPage from "@/pages/Documents";
import LibraryLog from "@/pages/LibraryLog";
import CleaningSchedule from "@/pages/CleaningSchedule";
import Classrooms from "@/pages/Classrooms";
import AttendancePage from "@/pages/Attendance";
import GradingStandards from "@/pages/GradingStandards";
import StudentGradeBook from "@/pages/StudentGradeBook";
import SubjectsPage from "@/pages/Subjects";
import MasterTimetable from "@/pages/Schedule/MasterTimetable";
import TeacherLoadSummary from "@/pages/Schedule/TeacherLoad";
import LeaveRequestsPage from "@/pages/LeaveRequests";
import LeaveRequestForm from "@/pages/LeaveRequests/LeaveRequestForm";
import LeaveReceiptPage from "@/pages/LeaveReceipt";
import TeacherLeaveRequestPage from "@/pages/TeacherLeaveRequest";
import TeacherLeavePrintPreviewPage from "@/pages/TeacherLeavePrintPreview";
import MyProfile from "@/pages/MyProfile";
import IdCardStudioPage from "@/pages/IdCardStudioPage";
import { TranslationProvider } from "@/lib/i18n";
import TelegramSettings from "@/pages/TelegramSettings";
import StudentTelegramManager from "@/pages/StudentTelegramManager";
import ParentTelegramManager from "@/pages/ParentTelegramManager";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { SecurityProvider, useSecurity } from "@/lib/security";
import { setupAxiosInterceptors } from "@/lib/axiosConfig";

import api from "@/lib/axiosConfig";
import { setCustomFetchFn } from "@workspace/api-client-react";

// Setup axios interceptors for CSRF token and security headers
setupAxiosInterceptors();

// Wrap Axios to act as fetch for api-client-react
setCustomFetchFn(async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
  
  // Prevent double /api/api/ prefix since Axios already has baseURL: '/api'
  if (url.startsWith('/api/')) {
    url = url.substring(4);
  }
  
  // Convert Headers object or headers initializer to plain object for Axios
  const headersObj: Record<string, string> = {};
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else {
      Object.keys(init.headers).forEach((key) => {
        headersObj[key] = (init.headers as Record<string, string>)[key];
      });
    }
  }
  
  try {
    const res = await api({
      url,
      method: init?.method || "GET",
      headers: headersObj,
      data: (function() {
        if (!init?.body) return undefined;
        if (typeof init.body === "string") {
          try { return JSON.parse(init.body); } catch(e) { return init.body; }
        }
        return init.body;
      })(),
    });
    
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      statusText: res.statusText,
      headers: new Headers(res.headers as any),
      text: async () => typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
      json: async () => res.data,
      blob: async () => res.data,
    } as unknown as Response;
  } catch (error: any) {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers as any),
        text: async () => typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
        json: async () => error.response.data,
      } as unknown as Response;
    }
    throw error;
  }
});

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      staleTime: 30_000,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        return failureCount < 1;
      }
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        return failureCount < 1;
      }
    }
  }
});

/** Wrap a route so only admin role can access it */
function AdminOnly({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  if (user?.role !== "admin") {
    console.warn(`[SECURITY] Unauthorized access attempt to admin route by user: ${user?.id || 'unknown'}`);
    navigate("/");
    return null;
  }
  return <Component />;
}

/** Teacher-only route guard */
function TeacherOnly({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  if (user?.role !== "teacher" && user?.role !== "admin") {
    console.warn(`[SECURITY] Unauthorized access attempt to teacher route by user: ${user?.id || 'unknown'}`);
    navigate("/");
    return null;
  }
  return <Component />;
}

/** Session timeout warning component */
function SessionTimeoutWarning() {
  const { sessionExpiryWarning, clearWarning } = useSecurity();
  
  if (!sessionExpiryWarning) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <span>⚠️</span>
        <span>Your session will expire in {Math.ceil(sessionExpiryWarning / 60)} minutes</span>
        <button 
          onClick={clearWarning}
          className="ml-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-3 text-gray-500">Loading secure session...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <AdminLayout>
      <SessionTimeoutWarning />
      <Switch>
        {/* Routes available to both Admin and Teacher */}
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={StudentsPage} />
        <Route path="/administrative/attendance" component={AttendancePage} />
        <Route path="/administrative/grades" component={GradesPage} />
        <Route path="/administrative/gradebook" component={StudentGradeBook} />
        <Route path="/administrative/id-cards" component={IdCardStudioPage} />
        <Route path="/administrative/cleaning" component={CleaningSchedule} />
        <Route path="/administrative/telegram-students" component={StudentTelegramManager} />
        <Route path="/administrative/telegram-parents" component={ParentTelegramManager} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/leave-requests" component={LeaveRequestsPage} />
        <Route path="/leave-requests/new" component={LeaveRequestForm} />
        <Route path="/leave-requests/:id">
          {(params) => <LeaveReceiptPage id={params.id ?? ""} />}
        </Route>
        
        {/* Teacher-only routes */}
        <Route path="/teacher/leave-request">
          <TeacherOnly component={TeacherLeaveRequestPage} />
        </Route>
        <Route path="/teacher/leave-request/:id">
          {(params) => <TeacherOnly component={() => <TeacherLeavePrintPreviewPage id={params.id ?? ""} />} />}
        </Route>
        
        {/* Common routes */}
        <Route path="/my-profile" component={MyProfile} />
        <Route path="/documents" component={DocumentsPage} />

        {/* Admin-only routes */}
        <Route path="/news">
          <AdminOnly component={NewsPage} />
        </Route>
        <Route path="/activities">
          <AdminOnly component={ActivitiesPage} />
        </Route>
        <Route path="/teachers">
          <AdminOnly component={TeachersPage} />
        </Route>
        <Route path="/classrooms">
          <AdminOnly component={Classrooms} />
        </Route>
        <Route path="/schedule/master">
          <AdminOnly component={MasterTimetable} />
        </Route>
        <Route path="/schedule/teacher-load">
          <AdminOnly component={TeacherLoadSummary} />
        </Route>
        <Route path="/contacts">
          <AdminOnly component={ContactsPage} />
        </Route>
        <Route path="/telegram-inbox">
          <AdminOnly component={TelegramInbox} />
        </Route>
        <Route path="/administrative/library">
          <AdminOnly component={LibraryLog} />
        </Route>
        <Route path="/settings">
          <AdminOnly component={SettingsPage} />
        </Route>
        <Route path="/settings/grading-standards">
          <AdminOnly component={GradingStandards} />
        </Route>
        <Route path="/settings/subjects">
          <AdminOnly component={SubjectsPage} />
        </Route>
        <Route path="/settings/telegram">
          <AdminOnly component={TelegramSettings} />
        </Route>
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityProvider>
          <TranslationProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ProtectedApp />
            </WouterRouter>
            <Toaster />
            <PWAInstallBanner />
          </TranslationProvider>
        </SecurityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;