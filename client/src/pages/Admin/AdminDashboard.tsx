// client/src/pages/Admin/AdminDashboard.tsx

import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient"; // Use updated apiRequest
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { LogOut, Settings, FileText, Mail, Users, Palette, MessageSquare, Image as ImageIcon } from "lucide-react"; // Added Palette, MessageSquare, ImageIcon

// Define the structure of the stats object expected from the API
interface DashboardStat {
  label: string;
  value: number;
  icon: string; // Emoji or icon identifier
  link: string; // Route to link to
}

// Removed separate fetchAdminStats function

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Fetch dashboard statistics using useQuery and apiRequest directly
  const { data: dashboardStats, isLoading: isLoadingStats, isError: isErrorStats, error: errorStats } = useQuery<DashboardStat[], Error>({
    queryKey: ['adminStats'], // Unique key for caching this query
    // --- UPDATED queryFn ---
    queryFn: () => apiRequest<DashboardStat[]>("GET", "/api/admin/stats"), // Use apiRequest directly
    // --- End Update ---
    staleTime: 1000 * 60 * 1, // Consider data stale after 1 minute
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

   // Logout handler
   const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                toast({ title: "Logged Out", description: "You have been successfully logged out." });
            },
            onError: (err) => {
                 toast({ title: "Logout Failed", description: err.message || "An error occurred during logout.", variant: "destructive" });
            }
        });
    };

  return (
    <div className="min-h-screen bg-parchment">

      {/* Admin Header */}
      <div className="bg-monastic-red text-parchment p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <h1 className="font-trajan text-xl tracking-wide">Sacred Bhutan Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-garamond hidden sm:inline">
                Welcome, {user?.username || 'Admin'}
            </span>

            <Button
              size="sm"
              className="bg-monastic-red text-parchment hover:bg-monastic-red/90"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              aria-label="Logout"
            >
            Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Main Content */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-3xl text-monastic-red mb-8 text-center md:text-left">Dashboard Overview</h2>

        {/* Statistics Section */}
         {isLoadingStats ? (
            <div className="flex justify-center items-center h-32"> <Loader /> </div>
        ) : isErrorStats ? (
            <div className="text-center text-destructive bg-red-100 border border-destructive p-4 rounded-md mb-8">
                Error loading dashboard stats: {errorStats?.message || "Unknown error"}
            </div>
        ) : dashboardStats && dashboardStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dashboardStats.map((stat) => (
                    <Card key={stat.label} className="border-faded-gold bg-parchment/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-monastic-red">{stat.label}</CardTitle>
                            <span className="text-2xl text-monastic-red/80" role="img" aria-label={`${stat.label} icon`}>{stat.icon}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-charcoal">{stat.value}</div>
                            <Link href={stat.link} className="text-xs text-monastic-red hover:text-terracotta mt-1 inline-block font-semibold">
                                Manage →
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center text-charcoal/80 bg-gray-100 border border-gray-300 p-4 rounded-md mb-8">
                Could not load dashboard statistics.
            </div>
        )}

        {/* Management Links Sections */}
        <div className="space-y-10">
            {/* Content Management */}
            <div>
                <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2 flex items-center gap-2">
                    <Palette className="h-5 w-5" /> Page Content
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/content/home" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Home Page</CardTitle></CardHeader><CardContent><p>Edit hero, intro, features, etc.</p></CardContent></Card></Link>
                    <Link href="/admin/content/about" className="block group"><Card className="dash-card"><CardHeader><CardTitle>About Page</CardTitle></CardHeader><CardContent><p>Edit history, mission, values.</p></CardContent></Card></Link>
                    <Link href="/admin/content/contact" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Contact Page</CardTitle></CardHeader><CardContent><p>Edit address, map, hours.</p></CardContent></Card></Link>
                    <Link href="/admin/content/gallery" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Gallery Page</CardTitle></CardHeader><CardContent><p>Edit gallery intro text.</p></CardContent></Card></Link>
                </div>
            </div>

             {/* Data Management */}
            <div>
                 <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Data Management
                </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     <Link href="/admin/tours" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Tours</CardTitle></CardHeader><CardContent><p>Add, edit, delete pilgrimage tours.</p></CardContent></Card></Link>
                     <Link href="/admin/testimonials" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Testimonials</CardTitle></CardHeader><CardContent><p>Manage pilgrim testimonials.</p></CardContent></Card></Link>
                     <Link href="/admin/gallery" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Gallery Images</CardTitle></CardHeader><CardContent><p>Upload & manage gallery photos.</p></CardContent></Card></Link>
                 </div>
             </div>

            {/* Communication */}
             <div>
                <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5"/> Communication
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/inquiries" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Tour Inquiries</CardTitle></CardHeader><CardContent><p>View and handle tour inquiries.</p></CardContent></Card></Link>
                    <Link href="/admin/messages" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Contact Messages</CardTitle></CardHeader><CardContent><p>View contact form messages.</p></CardContent></Card></Link>
                </div>
             </div>

            {/* Settings */}
             <div>
                <h3 className="font-trajan text-xl text-monastic-red mb-4 border-b border-faded-gold pb-2 flex items-center gap-2">
                    <Settings className="h-5 w-5"/> Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/settings/site" className="block group"><Card className="dash-card"><CardHeader><CardTitle>Site Settings</CardTitle></CardHeader><CardContent><p>Edit site name & global settings.</p></CardContent></Card></Link>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for consistent card styling (optional)
function DashCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Card className={`border-faded-gold hover:border-monastic-red transition-colors h-full bg-parchment/50 shadow-sm group-hover:shadow-lg ${className}`}>
      {children}
    </Card>
  );
}
function DashCardPlaceholder({ children, className }: { children: React.ReactNode, className?: string }) {
     return (
         <Card className={`border-dashed border-faded-gold/50 bg-parchment/30 h-full flex items-center justify-center text-charcoal/60 p-4 ${className}`}>
           {children}
         </Card>
     );
}