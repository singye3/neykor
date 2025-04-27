// client/src/pages/Admin/ManageInquiries.tsx
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardTitle
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Inquiry } from "@shared/schema";
// Removed useAuth as 'user' variable was not used

export default function ManageInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inquiries using useQuery and apiRequest directly
  const { data: inquiries, isLoading, isError, error } = useQuery<Inquiry[], Error>({
    queryKey: ['adminInquiries'], // Use a specific key for admin data
    // --- UPDATED queryFn ---
    queryFn: () => apiRequest<Inquiry[]>("GET", "/api/inquiries"), // Specify expected type
    // --- End Update ---
    staleTime: 1000 * 60 * 1, // Refetch admin inquiries every minute if stale
    refetchOnWindowFocus: true,
  });

  // Mutation for marking an inquiry as handled
  const markAsHandledMutation = useMutation<Inquiry, Error, number>({ // Expects ID (number), returns updated Inquiry
    // --- UPDATED mutationFn ---
    mutationFn: async (id: number) => {
      // Use apiRequest which returns parsed JSON or throws
      return apiRequest<Inquiry>("PATCH", `/api/inquiries/${id}`, { handled: true });
    },
    // --- End Update ---
    onSuccess: (updatedInquiry) => { // onSuccess receives the updated inquiry
      toast({
        title: "Inquiry Updated",
        description: `Inquiry from ${updatedInquiry.name} marked as handled.`,
      });
      // Update the specific inquiry in the cache or invalidate the whole list
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      // Optionally update adminStats if that query exists and depends on this
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => {
      toast({
        title: "Update Failed",
        description: err.message || "There was an error updating the inquiry status.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting an inquiry
  const deleteMutation = useMutation<{ message: string }, Error, number>({ // Expects ID, returns success message object
    // --- UPDATED mutationFn ---
    mutationFn: async (id: number) => {
        // Use apiRequest. The backend returns { message: "..." } on success
        return apiRequest<{ message: string }>("DELETE", `/api/inquiries/${id}`);
    },
    // --- End Update ---
    onSuccess: (data) => { // data here is { message: "..." }
      toast({
        title: "Inquiry Deleted",
        description: data.message || "The inquiry has been successfully deleted.",
      });
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
       // Optionally update adminStats
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => {
      toast({
        title: "Delete Failed",
        description: err.message || "There was an error deleting the inquiry.",
        variant: "destructive",
      });
    },
  });

  // Handler to trigger marking as handled
  const handleMarkAsHandled = (id: number) => {
    markAsHandledMutation.mutate(id);
  };

  // Handler to trigger deletion with confirmation
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this inquiry? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
        {/* Admin Header */}
      <div className="bg-monastic-red text-parchment p-4 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 hover:text-faded-gold transition-colors">
            <span className="text-2xl">
              {bhutaneseSymbols.dharmaWheel}
            </span>
          </Link>
          </div>
          <span className="font-garamond">Manage Tour Inquiries</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Customer Tour Inquiries</h2>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : isError ? (
          // Error State
          <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-xl mx-auto">
             <h3 className="font-semibold text-lg mb-2">Error Loading Inquiries</h3>
             <p>{error?.message || "Could not load inquiries at this time."}</p>
          </div>
        ) : inquiries && inquiries.length > 0 ? (
           // Success State - Inquiries Exist
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className={`border-faded-gold bg-parchment/60 ${inquiry.handled ? 'opacity-70' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    {/* Inquiry Details */}
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-trajan text-lg text-monastic-red">{inquiry.name}</h3>
                        <Badge variant={inquiry.handled ? "outline" : "default"} className={inquiry.handled ? "border-gray-400 text-gray-600" : "bg-blue-600 text-white"}>
                          {inquiry.handled ? "Handled" : "New"}
                        </Badge>
                      </div>
                      <p className="font-garamond text-sm text-charcoal/90">
                        <strong className="font-semibold">Email:</strong> <a href={`mailto:${inquiry.email}`} className="text-blue-700 hover:underline">{inquiry.email}</a>
                      </p>
                      <p className="font-garamond text-sm text-charcoal/90">
                        <strong className="font-semibold">Interested Tour:</strong> {inquiry.tourName} (ID: {inquiry.tourId})
                      </p>
                      <p className="font-garamond text-sm text-charcoal/80 mb-3">
                        <strong className="font-semibold">Received:</strong> {inquiry.createdAt ? formatDate(new Date(inquiry.createdAt)) : 'N/A'}
                      </p>
                      <p className="font-garamond mt-2 border-l-2 border-faded-gold pl-3 py-1 bg-white/30 text-charcoal text-base leading-relaxed whitespace-pre-wrap">
                        {inquiry.message}
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 flex-shrink-0 pt-1 md:pt-0 md:ml-4">
                      {!inquiry.handled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-500 hover:bg-green-50"
                          onClick={() => handleMarkAsHandled(inquiry.id)}
                          // Disable button while this specific mutation is pending for this ID
                          disabled={markAsHandledMutation.isPending && markAsHandledMutation.variables === inquiry.id}
                        >
                          {/* Show loader only for the specific button being clicked */}
                          {markAsHandledMutation.isPending && markAsHandledMutation.variables === inquiry.id ? 'Processing...' : 'Mark Handled'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(inquiry.id)}
                        // Disable button while this specific mutation is pending for this ID
                        disabled={deleteMutation.isPending && deleteMutation.variables === inquiry.id}
                      >
                         {/* Show loader only for the specific button being clicked */}
                         {deleteMutation.isPending && deleteMutation.variables === inquiry.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Success State - No Inquiries Found
          <div className="text-center py-12 border border-dashed border-faded-gold rounded bg-parchment/40">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Inquiries Found</h3>
            <p className="font-garamond text-charcoal/80">There are currently no customer inquiries to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}