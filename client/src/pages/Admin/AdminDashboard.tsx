import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  link: string;
}

// Fetch function for dashboard stats
async function fetchAdminStats(): Promise<DashboardStat[]> {
    const res = await apiRequest("GET", "/api/admin/stats");
    return res.json();
}

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast(); // Get toast function

  const { data: dashboardStats, isLoading, isError, error } = useQuery<DashboardStat[], Error>({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    staleTime: 1000 * 60, // Refetch stats every minute
  });

   // Handle logout click
   const handleLogout = () => {
        logoutMutation.mutate(undefined, { // Pass undefined as argument if mutate expects one
            onSuccess: () => {
                toast({ title: "Logged Out", description: "You have been successfully logged out." });
                // Redirect is handled by useAuth hook typically
            },
            onError: (err) => {
                 toast({ title: "Logout Failed", description: err.message || "An error occurred during logout.", variant: "destructive" });
            }
        });
    };


  return (
    <div className="min-h-screen bg-parchment">
      {/* Admin Header */}
      <div className="bg-monastic-red text-parchment p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <h1 className="font-trajan text-xl">Sacred Bhutan Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-garamond">Welcome, {user?.username || 'Admin'}</span>
            <Button
              variant="outline"
              size="sm" // Smaller button
              className="text-parchment border-parchment hover:bg-monastic-red/80 hover:text-parchment"
              onClick={handleLogout} // Use handler
              disabled={logoutMutation.isPending} // Disable while logging out
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Dashboard</h2>

        {/* Stats Section */}
         {isLoading ? (
          <div className="flex justify-center py-8"> <Loader /> </div>
        ) : isError ? (
            <div className="text-center text-red-500">Error loading stats: {error?.message}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {dashboardStats?.map((stat, index) => (
              <Card key={index} className="border-faded-gold bg-parchment/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium text-monastic-red">
                       {stat.label}
                   </CardTitle>
                   <span className="text-xl">{stat.icon}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-charcoal">{stat.value}</div>
                   <Link href={stat.link} className="text-xs text-monastic-red hover:text-terracotta mt-1 inline-block">
                    View Details →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Management Links Section */}
        <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2">Content Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/tours" className="block">
            <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50">
              <CardHeader>
                <CardTitle className="text-lg text-monastic-red">Manage Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-garamond text-sm">Add, edit, or remove pilgrimage tours and itineraries.</p>
              </CardContent>
            </Card>
          </Link>

           {/* NEW: Link to Manage About Content */}
          <Link href="/admin/content/about" className="block">
            <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50">
              <CardHeader>
                <CardTitle className="text-lg text-monastic-red">Manage About Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-garamond text-sm">Edit the text and image displayed on the About Us page.</p>
              </CardContent>
            </Card>
          </Link>

          {/* Add links for Gallery, Testimonials etc. here later */}
           {/* <Link href="/admin/gallery" className="block"> ... </Link> */}
           {/* <Link href="/admin/testimonials" className="block"> ... </Link> */}
        </div>

         <h3 className="font-trajan text-xl text-monastic-red mt-8 mb-4 border-b border-faded-gold pb-2">Communication</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/inquiries" className="block">
                <Card className="border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50">
                <CardHeader>
                    <CardTitle className="text-lg text-monastic-red">Manage Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-garamond text-sm">View and respond to customer tour inquiries.</p>
                </CardContent>
                </Card>
            </Link>
            {/* Add link for Contact Messages here later */}
            {/* <Link href="/admin/messages" className="block"> ... </Link> */}
         </div>
      </div>
    </div>
  );
}