// client/src/pages/Admin/ManageTours.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Card, CardContent } from "@/components/ui/card"; // Removed unused CardHeader, CardTitle here
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Tour } from "@shared/schema";
import TourForm from "./TourForm"; // The dialog form component
import { Pencil, Trash2, PlusCircle, Loader2 } from "lucide-react"; // Icons

// Removed separate fetch function, using queryFn directly

export default function ManageTours() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showTourForm, setShowTourForm] = useState(false);

  // Fetch all tours for the admin list
  const { data: tours, isLoading, isError, error } = useQuery<Tour[], Error>({
    queryKey: ['adminTours'], // Specific key for admin view of tours
    queryFn: () => apiRequest<Tour[]>("GET", '/api/tours'), // Fetch all tours using corrected apiRequest
    staleTime: 1000 * 60 * 5, // Cache admin tour list for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Mutation for deleting a tour
  const deleteMutation = useMutation<{ message: string }, Error, number>({ // Expects ID, returns success message object
    mutationFn: async (id: number) => {
        // Use apiRequest, expects { message: '...' } on success
        return apiRequest<{ message: string }>("DELETE", `/api/tours/${id}`);
    },
    onSuccess: (data) => {
      toast({
        title: "Tour Deleted",
        description: data.message || "The tour has been successfully deleted.",
      });
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['adminTours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featuredTours'] });
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] }); // Optional
    },
    onError: (err) => {
      toast({
        title: "Delete Failed",
        description: err.message || "There was an error deleting the tour.",
        variant: "destructive",
      });
    },
  });

  // --- Handlers ---
  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the tour "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateTour = () => {
    setSelectedTour(null); // Ensure no tour data is passed for creation
    setShowTourForm(true);
  };

  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour); // Pass the specific tour data for editing
    setShowTourForm(true);
  };

  const handleCloseTourForm = () => {
    setShowTourForm(false);
    setSelectedTour(null); // Reset selected tour when closing
  };

  // --- Render Logic ---
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
          <span className="font-garamond">Manage Tours</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6 border-b border-faded-gold pb-3">
          <h2 className="font-trajan text-2xl text-monastic-red">All Pilgrimage Tours</h2>
          <Button
            variant="default"
            onClick={handleCreateTour}
            className="bg-green-700 hover:bg-green-800" // Style the add button
          >
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add New Tour
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
         ) : isError ? (
             // Error State
             <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-xl mx-auto">
               <h3 className="font-semibold text-lg mb-2">Error Loading Tours</h3>
               <p>{error?.message || "Could not load tour data."}</p>
            </div>
        ) : tours && tours.length > 0 ? (
            // Success State - Tours List
          <div className="space-y-4">
            {tours.map((tour) => (
              <Card key={tour.id} className="border-faded-gold bg-parchment/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                     {/* Tour Info */}
                    <div className="flex-grow">
                      <h3 className="font-trajan text-lg text-monastic-red">{tour.title}</h3>
                      <p className="font-garamond text-sm text-charcoal/90 flex flex-wrap gap-x-3 items-center">
                        <span><strong className="font-semibold">Duration:</strong> {tour.duration}</span>
                        <span><strong className="font-semibold">Difficulty:</strong> {tour.difficulty}</span>
                        <span><strong className="font-semibold">Location:</strong> {tour.location}</span>
                         <span><strong className="font-semibold">Price:</strong> ${tour.price.toLocaleString()}</span>
                        <Badge variant={tour.featured ? "default": "outline"} className={`ml-auto md:ml-2 ${tour.featured ? 'bg-yellow-600 text-white': 'border-faded-gold text-charcoal/90'}`}>
                            {tour.featured ? "Featured" : "Standard"}
                        </Badge>
                      </p>
                    </div>
                     {/* Action Buttons */}
                    <div className="flex space-x-2 flex-shrink-0 self-start md:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-charcoal border-faded-gold hover:bg-faded-gold/10"
                        onClick={() => handleEditTour(tour)}
                        aria-label={`Edit ${tour.title}`}
                      >
                        <Pencil className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(tour.id, tour.title)}
                         // Disable only if deleting *this specific* tour
                        disabled={deleteMutation.isPending && deleteMutation.variables === tour.id}
                        aria-label={`Delete ${tour.title}`}
                        className="bg-red-700 hover:bg-red-800"
                      >
                         {/* Show spinner only when deleting this specific item */}
                         {deleteMutation.isPending && deleteMutation.variables === tour.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                            <Trash2 className="h-4 w-4"/>
                         )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
            // Success State - No Tours Found
             <div className="text-center py-12 border border-dashed border-faded-gold rounded bg-parchment/40">
               <h3 className="font-trajan text-xl text-monastic-red mb-2">No Tours Found</h3>
               <p className="font-garamond text-charcoal/80">Click "Add New Tour" to create the first pilgrimage journey.</p>
             </div>
        )}

        <TourForm
          tour={selectedTour ?? undefined} // Pass selected tour or undefined
          isOpen={showTourForm}
          onClose={handleCloseTourForm}
        />
      </div>
    </div>
  );
}