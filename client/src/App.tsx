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
// import AdminLogin from "@/pages/AdminLogin"; // Might not be needed if AuthPage handles both
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import ManageTours from "@/pages/Admin/ManageTours";
import ManageInquiries from "@/pages/Admin/ManageInquiries";
import ManageAboutContent from "@/pages/Admin/ManageAboutContent"; // <-- Import new page
import NotFound from "@/pages/not-found";
// import { AdminProvider } from "@/contexts/AdminContext"; // Likely replaced by AuthProvider
import { AuthProvider, useAuth } from "@/hooks/use-auth"; // Import useAuth as well
import { ProtectedRoute } from "./lib/protected-route";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional: DevTools

function Router() {
  const [location] = useLocation();
  // Use useAuth hook to determine if admin area should be shown differently
  const { user, isLoading } = useAuth();
  // Define admin routes separately for clarity
  const isAdminRoute = location.startsWith("/admin");
  const isAuthRoute = location === "/auth"; // Check for the auth page itself

  // Decide whether to show Header/Footer
  // Don't show on admin routes OR the auth page
  const showLayout = !isAdminRoute && !isAuthRoute;

  return (
    <>
      {showLayout && <Header />}
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/pilgrimages" component={PilgrimagesPage} />
        <Route path="/pilgrimages/:id" component={TourDetailPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/contact" component={ContactPage} />

        {/* Auth Route */}
        <Route path="/auth" component={AuthPage} />

        {/* Admin Routes */}
        {/* Redirect /admin to /admin/dashboard if logged in, otherwise to /auth */}
        <Route path="/admin">
          {() => <ProtectedRoute path="/admin" component={AdminDashboard} />}
        </Route>
        {/* <Route path="/admin/login" component={AuthPage} /> Use /auth instead */}

        {/* Protected Admin Routes */}
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/tours" component={ManageTours} />
        <ProtectedRoute path="/admin/inquiries" component={ManageInquiries} />
        {/* NEW: Route for managing about content */}
        <ProtectedRoute path="/admin/content/about" component={ManageAboutContent} />
        {/* Add other protected admin routes here */}

        {/* Catch-all Not Found Route */}
        <Route component={NotFound} />
      </Switch>
      {showLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* AuthProvider wraps everything */}
          <TooltipProvider>
            <Toaster />
            <Router />
            {/* Optional: React Query DevTools */}
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;