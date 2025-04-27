// client/src/pages/Admin/ManageTestimonials.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import TestimonialForm from "./TestimonialForm"; // Import the form component
import { Testimonial } from "@shared/schema";
import { Pencil, Trash2, PlusCircle, Loader2 } from "lucide-react"; // Icons, added Loader2

// Removed separate fetchAdminTestimonials function

export default function ManageTestimonials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Fetch testimonials for the admin list using useQuery and apiRequest directly
  const { data: testimonials, isLoading, isError, error } = useQuery<Testimonial[], Error>({
    queryKey: ['adminTestimonials'], // Unique key for admin data
    // --- UPDATED queryFn ---
    queryFn: () => apiRequest<Testimonial[]>("GET", "/api/admin/testimonials"),
    // --- End Update ---
    staleTime: 1000 * 60 * 5, // Cache admin testimonials for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Mutation to delete a testimonial
  const deleteMutation = useMutation<{ message: string }, Error, number>({
    // --- UPDATED mutationFn ---
    mutationFn: async (id: number) => {
        // apiRequest handles parsing and errors. Expects { message: '...' } response
        return apiRequest<{ message: string }>("DELETE", `/api/admin/testimonials/${id}`);
    },
    // --- End Update ---
    onSuccess: (data) => { // data here is { message: "..." }
      toast({ title: "Testimonial Deleted", description: data.message || "Testimonial removed successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] }); // Refetch admin list
      queryClient.invalidateQueries({ queryKey: ['testimonials'] }); // Refetch public list
    },
    onError: (err) => {
      toast({ title: "Delete Failed", description: err.message || "Could not delete the testimonial.", variant: "destructive" });
    },
  });

  // --- Handlers ---
  const handleOpenForm = (testimonial: Testimonial | null = null) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
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
            <span className="font-garamond">Manage Testimonials</span>
         </div>
       </div>

      {/* Content Area */}
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-trajan text-2xl text-monastic-red">Pilgrim Chronicles (Testimonials)</h2>
          <Button onClick={() => handleOpenForm(null)} className="bg-green-700 hover:bg-green-800">
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Testimonial
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-16"> <Loader /> </div>
        ) : isError ? (
          // Error State
          <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-xl mx-auto">
             <h3 className="font-semibold text-lg mb-2">Error Loading Testimonials</h3>
             <p>{error?.message || "Could not load testimonials."}</p>
          </div>
        ) : testimonials && testimonials.length > 0 ? (
           // Success State - Testimonials Exist
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-faded-gold bg-parchment/50 flex flex-col shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-monastic-red font-semibold font-garamond">{testimonial.name}</CardTitle>
                  {testimonial.location && (
                    <p className="text-sm text-charcoal/80 font-garamond">{testimonial.location}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                   {/* Use blockquote for semantic quoting */}
                  <blockquote className="border-l-4 border-faded-gold pl-4 italic text-charcoal">
                     <p className="font-garamond leading-relaxed">"{testimonial.content}"</p>
                  </blockquote>
                </CardContent>
                 <CardFooter className="pt-3 border-t border-faded-gold/30 flex justify-end space-x-2">
                    {/* Edit Button */}
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(testimonial)} className="border-faded-gold text-charcoal hover:bg-faded-gold/10">
                        <Pencil className="h-4 w-4"/>
                    </Button>
                    {/* Delete Button */}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(testimonial.id, testimonial.name)}
                        // Disable only if deleting *this specific* testimonial
                        disabled={deleteMutation.isPending && deleteMutation.variables === testimonial.id}
                        className="bg-red-700 hover:bg-red-800"
                    >
                        {/* Show spinner only when deleting this specific item */}
                        {deleteMutation.isPending && deleteMutation.variables === testimonial.id ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <Trash2 className="h-4 w-4"/>
                        )}
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
           // Success State - No Testimonials
          <div className="text-center py-12 border border-dashed border-faded-gold rounded bg-parchment/40">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Testimonials Found</h3>
            <p className="font-garamond text-charcoal/80">Click "Add New Testimonial" to share pilgrim experiences.</p>
          </div>
        )}
      </div>

      {/* Form Dialog Component (controlled by isFormOpen state) */}
      <TestimonialForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        testimonial={editingTestimonial} // Pass null or the testimonial object
      />
    </div>
  );
}