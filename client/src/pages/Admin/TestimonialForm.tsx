// client/src/pages/Admin/TestimonialForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Testimonial, InsertTestimonial, insertTestimonialSchema } from "@shared/schema"; // Use InsertTestimonial

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Import Description too
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";

// Define props for the form component
interface TestimonialFormProps {
  testimonial?: Testimonial | null; // Current testimonial for editing, or null for creating
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Function to close the dialog
}

// Use the insert schema for form validation AND as the basis for form values
type TestimonialFormValues = InsertTestimonial; // Form data matches insertion type

export default function TestimonialForm({ testimonial, isOpen, onClose }: TestimonialFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!testimonial; // True if a testimonial object is passed

  // Initialize React Hook Form
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(insertTestimonialSchema), // Use insert schema
    defaultValues: { // Default values matching InsertTestimonial
      name: "",
      location: "",
      content: "",
    },
  });

  // Populate form when opening for editing, or reset for creation
  useEffect(() => {
    if (isEditing && testimonial && isOpen) {
      // If editing, reset form with existing testimonial data
      form.reset({
        name: testimonial.name,
        location: testimonial.location || "", // Handle potential null location
        content: testimonial.content,
      });
    } else if (!isEditing && isOpen) {
      // If creating, reset to default empty values
      form.reset({ name: "", location: "", content: "" });
    }
  }, [testimonial, isEditing, isOpen, form]); // Dependencies

  // --- Mutations ---

  // Create Mutation
  const createMutation = useMutation<Testimonial, Error, InsertTestimonial>({ // Input type is InsertTestimonial
    // --- UPDATED mutationFn ---
    mutationFn: async (newData: InsertTestimonial) => {
        // Directly use apiRequest, expect Testimonial object in return
        return apiRequest<Testimonial>("POST", "/api/admin/testimonials", newData);
    },
    // --- End Update ---
    onSuccess: (createdData) => {
      toast({ title: "Testimonial Created", description: `"${createdData.name}" added successfully.` });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] }); // Refresh admin list
      queryClient.invalidateQueries({ queryKey: ['testimonials'] }); // Refresh public list
      onClose(); // Close dialog
    },
    onError: (error) => {
      toast({ title: "Creation Failed", description: error.message || "Could not create testimonial.", variant: "destructive" });
    },
  });

  // Update Mutation
  // The second generic (Error type) and third generic (Input Variables type) are crucial
  const updateMutation = useMutation<Testimonial, Error, { id: number } & Partial<InsertTestimonial>>({
     // --- UPDATED mutationFn ---
    mutationFn: async (updateDataWithId: { id: number } & Partial<InsertTestimonial>) => {
        const { id, ...dataToUpdate } = updateDataWithId;
        // Directly use apiRequest, expect updated Testimonial object in return
        return apiRequest<Testimonial>("PATCH", `/api/admin/testimonials/${id}`, dataToUpdate);
    },
    // --- End Update ---
    onSuccess: (updatedData) => {
      toast({ title: "Testimonial Updated", description: `"${updatedData.name}" updated successfully.` });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] }); // Refresh admin list
      queryClient.invalidateQueries({ queryKey: ['testimonials'] }); // Refresh public list
      onClose(); // Close dialog
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error.message || "Could not update testimonial.", variant: "destructive" });
    },
  });

  // Form submission handler
  const onSubmit = (values: TestimonialFormValues) => {
    if (isEditing && testimonial) {
        // For update, pass the validated form values along with the original ID
        updateMutation.mutate({ ...values, id: testimonial.id });
    } else {
        // For create, pass the validated form values
        createMutation.mutate(values);
    }
  };

  // Combined loading state
  const isPending = createMutation.isPending || updateMutation.isPending;

  // --- Render Logic ---
  if (!isOpen) return null; // Don't render anything if the dialog isn't open

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-parchment/95 border-monastic-red rounded shadow-lg">
        <DialogHeader>
          <DialogTitle className="font-trajan text-monastic-red">
            {isEditing ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
           {/* Optional: Add a description */}
           <DialogDescription>
             {isEditing ? "Modify the details for this testimonial." : "Enter the details for the new testimonial."}
           </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Form fields */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilgrim's Name</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g., Sarah M." className="parchment-input border-faded-gold" disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g., United States" className="parchment-input border-faded-gold" disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonial Content</FormLabel>
                  <FormControl><Textarea {...field} rows={6} placeholder="Enter the testimonial quote here..." className="parchment-input border-faded-gold" disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>

            {/* Dialog actions */}
             <DialogFooter className="pt-4">
                {/* Cancel button using DialogClose */}
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="border-faded-gold" disabled={isPending}>
                        Cancel
                    </Button>
                </DialogClose>
                {/* Submit button */}
                <Button type="submit" disabled={isPending} className="bg-monastic-red hover:bg-monastic-red/90 text-parchment min-w-[120px]">
                    {isPending ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                    ) : isEditing ? "Save Changes" : "Add Testimonial"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}