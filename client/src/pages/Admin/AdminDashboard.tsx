// client/src/pages/Admin/AdminDashboard.tsx
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  link: string;
}

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();

  const { data: dashboardStats, isLoading } = useQuery<DashboardStat[]>({
    queryKey: ['/api/admin/stats'],
  });

  return (
    <div className="min-h-screen bg-parchment">
      <div className="bg-monastic-red text-parchment p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <h1 className="font-trajan text-xl">Sacred Bhutan Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-garamond">Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              className="text-parchment border-parchment hover:bg-monastic-red/80 hover:text-parchment"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Dashboard</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {dashboardStats?.map((stat, index) => (
              <Card key={index} className="border-faded-gold">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-monastic-red flex items-center space-x-2">
                    <span>{stat.icon}</span>
                    <span>{stat.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <Link href={stat.link} className="text-monastic-red hover:text-terracotta text-sm mt-2 inline-block">
                    View Details &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/tours" className="block">
            <Card className="border-faded-gold hover:border-monastic-red transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-monastic-red">Manage Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-garamond">Add, edit, or remove pilgrimage tours.</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/inquiries" className="block">
            <Card className="border-faded-gold hover:border-monastic-red transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-monastic-red">Manage Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-garamond">View and respond to customer inquiries.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
