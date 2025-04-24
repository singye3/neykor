// src/pages/Admin/ManageTours.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Tour } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import TourForm from "./TourForm";

export default function ManageTours() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>(undefined);
  const [showTourForm, setShowTourForm] = useState(false);

  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours']
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/tours/${id}`, {}),
    onSuccess: () => {
      toast({
        title: "Tour Deleted",
        description: "The tour has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the tour.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateTour = () => {
    setSelectedTour(undefined);
    setShowTourForm(true);
  };

  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour);
    setShowTourForm(true);
  };

  const handleCloseTourForm = () => {
    setShowTourForm(false);
    setSelectedTour(undefined);
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
          <span className="font-garamond">Manage Tours</span>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-trajan text-2xl text-monastic-red">All Tours</h2>
          <Button 
            variant="default"
            onClick={handleCreateTour}
          >
            Add New Tour
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="space-y-4">
            {tours?.map((tour) => (
              <Card key={tour.id} className="border-faded-gold">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-trajan text-lg text-monastic-red">{tour.title}</h3>
                      <p className="font-garamond text-sm text-charcoal/80">
                        {tour.duration} • {tour.difficulty} • ${tour.price}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        className="text-charcoal border-faded-gold"
                        onClick={() => handleEditTour(tour)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(tour.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tour Form Dialog */}
        {showTourForm && (
          <TourForm 
            tour={selectedTour}
            isOpen={showTourForm}
            onClose={handleCloseTourForm}
          />
        )}
      </div>
    </div>
  );
}
