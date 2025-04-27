import { Switch, Route, useLocation } from "wouter"; // Removed Link as it's not used directly here
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiRequest } from "./lib/queryClient"; // For fetching site settings

// Import Core Layout & Providers
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Loader from "./components/shared/Loader"; // Loader for initial loading

// Import Public Page Components
import Home from "@/pages/Home";
import PilgrimagesPage from "@/pages/PilgrimagesPage";
import TourDetailPage from "@/pages/TourDetailPage";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Import Admin Page Components
// Import Admin Page Components
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import ManageTours from "@/pages/Admin/ManageTours";
import ManageInquiries from "@/pages/Admin/ManageInquiries";
import ManageAboutContent from "@/pages/Admin/ManageAboutContent";
import ManageMessages from "@/pages/Admin/ManageMessages";
import ManageTestimonials from "@/pages/Admin/ManageTestimonials";
import ManageHomePage from "@/pages/Admin/ManageHomePage";
import ManageSiteSettings from "@/pages/Admin/ManageSiteSettings";

// Optional DevTools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ManageGallery from "./pages/Admin/ManageGallery";
import ManageGalleryPageText from "./pages/Admin/ManageGalleryPageText";
import ManageContactPage from "./pages/Admin/ManageContactPage";

// Type for the public site settings fetch
interface PublicSiteSettings {
    siteName: string;
    // Add other public settings if needed later
}

// Fetch function for public site settings (runs once, cached)

async function fetchSiteSettings(): Promise<PublicSiteSettings> {
  try {
      const data = await apiRequest<PublicSiteSettings>("GET", "/api/settings/site");
      if (!data || typeof data.siteName !== 'string') {
          return { siteName: "Sacred Bhutan Travels (Default)" };
      }
      return data;
  } catch (error) {
      return { siteName: "Sacred Bhutan Travels (Fetch Error)" };
  }
}
function Router() {
  const [location] = useLocation();
  // isAuthLoading checks if the initial user session check is complete
  const { isLoading: isAuthLoading } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  const isAuthRoute = location === "/auth";

  // Fetch essential site settings needed for layout
  const { data: siteSettings, isLoading: isSettingsLoading, isError: isSettingsError } = useQuery<PublicSiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
    staleTime: Infinity,       // Data is static-ish, cache forever
    gcTime: Infinity,          // <-- RENAMED FROM cacheTime
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
});
  // Determine if core layout should be shown (not on admin or auth pages)
  const showLayout = !isAdminRoute && !isAuthRoute;

  // Show a loading indicator while checking auth state OR fetching initial site settings
  if (isAuthLoading || isSettingsLoading) {
       return (
            <div className="flex items-center justify-center min-h-screen bg-parchment">
                <Loader />
            </div>
       );
  }

  // Optional: Handle error fetching site settings gracefully
   if (isSettingsError) {
        console.error("FATAL: Could not load site settings for layout.");
        // You might want to render a generic error message or fallback layout
   }

  // Default site name if fetch fails or data isn't ready yet
  const siteNameForLayout = siteSettings?.siteName || "Sacred Bhutan Travels";

  return (
    <>
      {/* Render Header and Footer conditionally, passing siteName */}
      {showLayout && <Header siteName={siteNameForLayout} />}

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
        {/* Redirect /admin base path */}
        <Route path="/admin">
          {/* ProtectedRoute handles redirect logic based on auth state */}
          {() => <ProtectedRoute path="/admin" component={AdminDashboard} />}
        </Route>

        {/* Protected Admin Sub-Routes */}
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/tours" component={ManageTours} />
        <ProtectedRoute path="/admin/inquiries" component={ManageInquiries} />
        <ProtectedRoute path="/admin/messages" component={ManageMessages} />
        <ProtectedRoute path="/admin/testimonials" component={ManageTestimonials} />
        <ProtectedRoute path="/admin/content/about" component={ManageAboutContent} />
        <ProtectedRoute path="/admin/content/home" component={ManageHomePage} />
        <ProtectedRoute path="/admin/settings/site" component={ManageSiteSettings} />
        <ProtectedRoute path="/admin/gallery" component={ManageGallery} />
        <ProtectedRoute path="/admin/content/contact" component={ManageContactPage} />
        <ProtectedRoute path="/admin/content/gallery" component={ManageGalleryPageText} />

        <Route component={NotFound} />
      </Switch>

      {showLayout && <Footer /* siteName={siteNameForLayout} */ />}
    </>
  );
}

// Main App Component
function App() {
  return (
    // Provide React Query client
    <QueryClientProvider client={queryClient}>
      {/* Provide Authentication context */}
      <AuthProvider>
          {/* Provide Tooltip context (used by some shadcn components) */}
          <TooltipProvider>
            {/* Toaster for notifications */}
            <Toaster />
            {/* Main Router logic */}
            <Router />
            {/* React Query DevTools (only shown in development) */}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom" />}
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; // Export the App component