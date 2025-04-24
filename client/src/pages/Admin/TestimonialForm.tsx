// client/src/pages/Admin/TestimonialForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Testimonial, insertTestimonialSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// Import Dialog components from shadcn
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Import DialogClose directly from Radix UI
import { DialogClose } from "@radix-ui/react-dialog"; // <-- CORRECT IMPORT
import { Loader2 } from "lucide-react";

// Define props for the form component
interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}

// Use the insert schema for form validation
type TestimonialFormValues = z.infer<typeof insertTestimonialSchema>;

export default function TestimonialForm({ testimonial, isOpen, onClose }: TestimonialFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!testimonial;

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: {
      name: "",
      location: "",
      content: "",
    },
  });

  // Populate form when opening for editing
  useEffect(() => {
    if (isEditing && testimonial && isOpen) {
      form.reset({
        name: testimonial.name,
        location: testimonial.location,
        content: testimonial.content,
      });
    } else if (!isEditing && isOpen) {
      form.reset({ name: "", location: "", content: "" });
    }
  }, [testimonial, isEditing, isOpen, form]);

  // --- Mutations ---
  const createMutation = useMutation<Testimonial, Error, TestimonialFormValues>({
    mutationFn: (data) => apiRequest("POST", "/api/admin/testimonials", data).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Testimonial Created", description: "New testimonial added successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Creation Failed", description: error.message || "Could not create testimonial.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation<Testimonial, Error, TestimonialFormValues>({
    mutationFn: (data) => apiRequest("PATCH", `/api/admin/testimonials/${testimonial?.id}`, data).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Testimonial Updated", description: "Testimonial updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error.message || "Could not update testimonial.", variant: "destructive" });
    },
  });

  const onSubmit = (values: TestimonialFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> {/* Call onClose when dialog is closed */}
      <DialogContent className="sm:max-w-[425px] bg-parchment/95">
        <DialogHeader>
          <DialogTitle className="font-trajan text-monastic-red">
            {isEditing ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Form Fields (Name, Location, Content) */}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Pilgrim's Name</FormLabel> <FormControl><Input {...field} placeholder="e.g., Sarah M." className="parchment-input" /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location (Country/City)</FormLabel> <FormControl><Input {...field} placeholder="e.g., United States" className="parchment-input" /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="content" render={({ field }) => ( <FormItem> <FormLabel>Testimonial Content</FormLabel> <FormControl><Textarea {...field} rows={5} placeholder="Enter the testimonial quote here..." className="parchment-input" /></FormControl> <FormMessage /> </FormItem> )} />

             <DialogFooter>
                {/* Wrap Cancel button with DialogClose */}
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="border-faded-gold">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
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