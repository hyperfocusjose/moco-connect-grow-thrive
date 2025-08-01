
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/DemoAuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import Polls from "./pages/Polls";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "@/contexts/DemoAuthContext";
import { AuthDebug } from "@/components/debug/AuthDebug";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Home redirect component to handle redirects based on auth state
const HomeRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
    </div>;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Index />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<AppLayout requireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AppLayout requireAuth requireAdmin />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
          <AuthDebug />
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
