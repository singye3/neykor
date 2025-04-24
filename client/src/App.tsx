import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import PilgrimagesPage from "@/pages/PilgrimagesPage";
import TourDetailPage from "@/pages/TourDetailPage";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/auth-page";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import ManageTours from "@/pages/Admin/ManageTours";
import ManageInquiries from "@/pages/Admin/ManageInquiries";
import NotFound from "@/pages/not-found";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pilgrimages" component={PilgrimagesPage} />
        <Route path="/pilgrimages/:id" component={TourDetailPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminLogin} />
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/tours" component={ManageTours} />
        <ProtectedRoute path="/admin/inquiries" component={ManageInquiries} />
        <Route component={NotFound} />
      </Switch>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
