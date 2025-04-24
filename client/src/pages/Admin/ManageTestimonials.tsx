// client/src/pages/Admin/ManageTestimonials.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import TestimonialForm from "./TestimonialForm"; // Import the form component
import { Testimonial } from "@shared/schema";
import { Pencil, Trash2, PlusCircle } from "lucide-react"; // Icons

// Fetch function for admin testimonials
async function fetchAdminTestimonials(): Promise<Testimonial[]> {
    const res = await apiRequest("GET", "/api/admin/testimonials");
    return res.json();
}

export default function ManageTestimonials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Fetch testimonials for the admin list
  const { data: testimonials, isLoading, isError, error } = useQuery<Testimonial[], Error>({
    queryKey: ['adminTestimonials'], // Unique key for admin data
    queryFn: fetchAdminTestimonials,
  });

  // Mutation to delete a testimonial
  const deleteMutation = useMutation<{ message: string }, Error, number>({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/testimonials/${id}`).then(res => res.json()),
    onSuccess: (data, deletedId) => {
      toast({ title: "Testimonial Deleted", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] }); // Refetch admin list
      queryClient.invalidateQueries({ queryKey: ['testimonials'] }); // Refetch public list
    },
    onError: (err) => {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleOpenForm = (testimonial: Testimonial | null = null) => {
    setEditingTestimonial(testimonial); // Set null for adding, testimonial object for editing
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null); // Clear editing state when closing
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Admin Header */}
       <div className="bg-monastic-red text-parchment p-4">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
                <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors">
                    Sacred Bhutan Admin
                </Link>
            </div>
            <span className="font-garamond">Manage Testimonials</span>
         </div>
       </div>

      {/* Content Area */}
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-trajan text-2xl text-monastic-red">Pilgrim Chronicles (Testimonials)</h2>
          <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Testimonial
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"> <Loader /> </div>
        ) : isError ? (
          <div className="text-center text-red-600 py-8"> Error loading testimonials: {error?.message} </div>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-faded-gold bg-parchment/50 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-monastic-red font-semibold font-garamond">{testimonial.name}</CardTitle>
                  <p className="text-sm text-charcoal/80 font-garamond">{testimonial.location}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="font-garamond italic text-charcoal">"{testimonial.content}"</p>
                </CardContent>
                 <CardFooter className="pt-4 border-t border-faded-gold/30 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(testimonial)} className="border-faded-gold text-charcoal">
                        <Pencil className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(testimonial.id, testimonial.name)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === testimonial.id}
                    >
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Testimonials Found</h3>
            <p className="font-garamond">Click "Add New Testimonial" to get started.</p>
          </div>
        )}
      </div>

      {/* Render the Form Dialog */}
      <TestimonialForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        testimonial={editingTestimonial}
      />
    </div>
  );
}