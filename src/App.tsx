import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              <Route element={<AppLayout requireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/polls" element={<Polls />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              <Route element={<AppLayout requireAuth requireAdmin />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
