// client/src/pages/Admin/ManageInquiries.tsx
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Inquiry } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function ManageInquiries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries']
  });

  const markAsHandledMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("PATCH", `/api/inquiries/${id}`, { handled: true }),
    onSuccess: () => {
      toast({
        title: "Inquiry Updated",
        description: "The inquiry has been marked as handled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating the inquiry.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/inquiries/${id}`, {}),
    onSuccess: () => {
      toast({
        title: "Inquiry Deleted",
        description: "The inquiry has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the inquiry.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsHandled = (id: number) => {
    markAsHandledMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <div className="bg-monastic-red text-parchment p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors">
              Sacred Bhutan Admin
            </Link>
          </div>
          <span className="font-garamond">Manage Inquiries</span>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Customer Inquiries</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="border-faded-gold">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-trajan text-lg text-monastic-red">{inquiry.name}</h3>
                        <Badge variant={inquiry.handled ? "default" : "secondary"}>
                          {inquiry.handled ? "Handled" : "New"}
                        </Badge>
                      </div>
                      <p className="font-garamond text-sm text-charcoal/80">
                        <span className="font-semibold">Email:</span> {inquiry.email}
                      </p>
                      <p className="font-garamond text-sm text-charcoal/80">
                        <span className="font-semibold">Tour:</span> {inquiry.tourName}
                      </p>
                      <p className="font-garamond text-sm text-charcoal/80">
                        <span className="font-semibold">Date:</span> {inquiry.createdAt ? formatDate(new Date(inquiry.createdAt)) : 'N/A'}
                      </p>
                      <p className="font-garamond mt-2 border-l-2 border-faded-gold pl-3 py-1">
                        {inquiry.message}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!inquiry.handled && (
                        <Button 
                          variant="outline"
                          className="text-charcoal border-faded-gold"
                          onClick={() => handleMarkAsHandled(inquiry.id)}
                          disabled={markAsHandledMutation.isPending}
                        >
                          Mark as Handled
                        </Button>
                      )}
                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(inquiry.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Inquiries Found</h3>
            <p className="font-garamond">There are currently no customer inquiries to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
