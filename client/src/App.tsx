// client/src/App.tsx
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import Pages
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import PilgrimagesPage from "@/pages/PilgrimagesPage";
import TourDetailPage from "@/pages/TourDetailPage";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import ManageTours from "@/pages/Admin/ManageTours";
import ManageInquiries from "@/pages/Admin/ManageInquiries";
import ManageAboutContent from "@/pages/Admin/ManageAboutContent";
import ManageMessages from "@/pages/Admin/ManageMessages";
import ManageTestimonials from "@/pages/Admin/ManageTestimonials";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  const isAuthRoute = location === "/auth";
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
        <Route path="/admin">
          {() => <ProtectedRoute path="/admin" component={AdminDashboard} />}
        </Route>

        {/* Protected Admin Routes */}
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/tours" component={ManageTours} />
        <ProtectedRoute path="/admin/inquiries" component={ManageInquiries} />
        <ProtectedRoute path="/admin/content/about" component={ManageAboutContent} />
        <ProtectedRoute path="/admin/messages" component={ManageMessages} /> 
        <ProtectedRoute path="/admin/testimonials" component={ManageTestimonials} />
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
      <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;