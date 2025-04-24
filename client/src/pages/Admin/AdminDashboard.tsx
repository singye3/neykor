// client/src/pages/Admin/AdminDashboard.tsx

import { Link } from "wouter"; // For navigation
import { useQuery } from "@tanstack/react-query"; // For data fetching
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // UI component
import { Button } from "@/components/ui/button"; // UI component
import { useAuth } from "@/hooks/use-auth"; // Authentication hook
import { useToast } from "@/hooks/use-toast"; // Toast notifications
import { apiRequest } from "@/lib/queryClient"; // Helper for API requests
import { bhutaneseSymbols } from "@/lib/utils"; // Theme symbols
import Loader from "@/components/shared/Loader"; // Loading indicator
import { LogOut } from "lucide-react"; // Icon for logout button

// Define the structure of the stats object expected from the API
interface DashboardStat {
  label: string;
  value: number;
  icon: string; // Emoji or icon identifier
  link: string; // Route to link to
}

// Async function to fetch dashboard statistics from the backend
async function fetchAdminStats(): Promise<DashboardStat[]> {
    const res = await apiRequest("GET", "/api/admin/stats"); // Uses helper that includes credentials
    if (!res.ok) {
        // apiRequest usually throws, but double-check
        const errorData = await res.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(errorData.message || `Failed to fetch admin stats: ${res.statusText}`);
    }
    return res.json();
}

export default function AdminDashboard() {
  // Get user info and logout mutation from the authentication context
  const { user, logoutMutation } = useAuth();
  // Get the toast function for showing notifications
  const { toast } = useToast();

  // Fetch dashboard statistics using React Query
  const { data: dashboardStats, isLoading: isLoadingStats, isError: isErrorStats, error: errorStats } = useQuery<DashboardStat[], Error>({
    queryKey: ['adminStats'], // Unique key for caching this query
    queryFn: fetchAdminStats, // The function to fetch the data
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

   // Handler for the logout button click
   const handleLogout = () => {
        logoutMutation.mutate(undefined, { // Pass undefined if mutate doesn't expect arguments
            onSuccess: () => {
                toast({ title: "Logged Out", description: "You have been successfully logged out." });
                // No need to redirect here, ProtectedRoute/useAuth should handle it
            },
            onError: (err) => {
                 toast({ title: "Logout Failed", description: err.message || "An error occurred during logout.", variant: "destructive" });
            }
        });
    };

  return (
    <div className="min-h-screen bg-parchment"> {/* Main container with theme background */}

      {/* Admin Header Section */}
      <div className="bg-monastic-red text-parchment p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Branding */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <h1 className="font-trajan text-xl tracking-wide">Sacred Bhutan Admin</h1>
          </div>
          {/* Welcome Message & Logout Button */}
          <div className="flex items-center space-x-4">
            <span className="font-garamond hidden sm:inline"> {/* Hide on small screens */}
                Welcome, {user?.username || 'Administrator'}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-parchment border-parchment hover:bg-monastic-red/80 hover:text-parchment"
              onClick={handleLogout}
              disabled={logoutMutation.isPending} // Disable button during logout process
              aria-label="Logout"
            >
              <LogOut className={`h-4 w-4 ${logoutMutation.isPending ? 'animate-spin' : ''}`}/> {/* Logout Icon */}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Main Content Area */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-3xl text-monastic-red mb-8 text-center md:text-left">Dashboard Overview</h2>

        {/* Statistics Section */}
         {isLoadingStats ? (
            <div className="flex justify-center items-center h-32"> <Loader /> </div>
        ) : isErrorStats ? (
            // Display error message if fetching stats failed
            <div className="text-center text-destructive bg-red-100 border border-destructive p-4 rounded-md">
                Error loading dashboard stats: {errorStats?.message || "Unknown error"}
            </div>
        ) : (
            // Display stats cards if data fetched successfully
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dashboardStats?.map((stat) => (
                <Card key={stat.label} className="border-faded-gold bg-parchment/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-monastic-red">
                        {stat.label}
                    </CardTitle>
                    <span className="text-2xl" role="img" aria-label={`${stat.label} icon`}>{stat.icon}</span> {/* Icon */}
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold text-charcoal">{stat.value}</div> {/* Stat value */}
                    <Link href={stat.link} className="text-xs text-monastic-red hover:text-terracotta mt-1 inline-block font-semibold">
                        Manage → {/* Link to manage section */}
                    </Link>
                    </CardContent>
                </Card>
                ))}
            </div>
        )}

        {/* Management Links Sections */}
        <div className="space-y-10">
            {/* Content Management Section */}
            <div>
                <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2">Content Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Manage Tours Card */}
                    <Link href="/admin/tours" className="block group">
                        <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg">
                        <CardHeader> <CardTitle className="text-lg text-monastic-red">Manage Tours</CardTitle> </CardHeader>
                        <CardContent> <p className="font-garamond text-sm">Add, edit, or remove pilgrimage tours and itineraries.</p> </CardContent>
                        </Card>
                    </Link>
                    {/* Manage About Page Card */}
                    <Link href="/admin/content/about" className="block group">
                        <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg">
                        <CardHeader> <CardTitle className="text-lg text-monastic-red">Manage About Page</CardTitle> </CardHeader>
                        <CardContent> <p className="font-garamond text-sm">Edit the text and image displayed on the About Us page.</p> </CardContent>
                        </Card>
                    </Link>
                    {/* Manage Testimonials Card */}
                    <Link href="/admin/testimonials" className="block group">
                        <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg">
                        <CardHeader> <CardTitle className="text-lg text-monastic-red">Manage Testimonials</CardTitle> </CardHeader>
                        <CardContent> <p className="font-garamond text-sm">Add, edit, or delete pilgrim testimonials.</p> </CardContent>
                        </Card>
                    </Link>
                    {/* Add Manage Gallery Link Here Later */}
                    {/* <Link href="/admin/gallery" className="block group"><Card>...</Card></Link> */}
                </div>
            </div>

            {/* Communication Section */}
             <div>
                <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2">Communication</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Manage Inquiries Card */}
                    <Link href="/admin/inquiries" className="block group">
                        <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg">
                        <CardHeader> <CardTitle className="text-lg text-monastic-red">Manage Tour Inquiries</CardTitle> </CardHeader>
                        <CardContent> <p className="font-garamond text-sm">View and respond to customer tour inquiries.</p> </CardContent>
                        </Card>
                    </Link>
                    {/* Manage Messages Card */}
                    <Link href="/admin/messages" className="block group">
                        <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg">
                        <CardHeader> <CardTitle className="text-lg text-monastic-red">Manage Contact Messages</CardTitle> </CardHeader>
                        <CardContent> <p className="font-garamond text-sm">View and manage messages sent via the contact form.</p> </CardContent>
                        </Card>
                    </Link>
                    {/* Add Manage Newsletter Subscribers Link Here Later? */}
                    {/* <Link href="/admin/subscribers" className="block group"><Card>...</Card></Link> */}
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}