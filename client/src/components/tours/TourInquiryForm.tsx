// client/src/components/tours/TourInquiryForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import type { Inquiry, InsertInquiry } from "@shared/schema"; // Import types

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import Loader

// Zod schema for form validation
const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Type for form values based on the schema
type InquiryFormValues = z.infer<typeof inquirySchema>;

// Props interface for the component
interface TourInquiryFormProps {
  tourId: number; // Changed back to number as it comes from tour.id
  tourName: string;
}

export default function TourInquiryForm({ tourId, tourName }: TourInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Initialize React Hook Form
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      // Pre-populate message with tour name for convenience
      message: `I'm interested in the "${tourName}" pilgrimage. Please send me more information regarding itinerary options and pricing.`,
    },
  });

  // Setup inquiry mutation using React Query
  const inquiryMutation = useMutation<Inquiry, Error, InsertInquiry>({ // Specify expected types
    // --- UPDATED mutationFn ---
    // Use async/await and specify expected return type from apiRequest
    mutationFn: async (data: InsertInquiry) => {
        // apiRequest handles fetch, error checks, and JSON parsing
        // It expects the full data payload matching InsertInquiry
        return apiRequest<Inquiry>("POST", "/api/inquiries", data);
    },
    // --- End Update ---
    onSuccess: (createdInquiry) => { // onSuccess receives the created Inquiry data
      toast({
        title: "Inquiry Sent Successfully",
        description: "Thank you for your interest! We have received your request and will respond shortly.",
      });
      setSubmitted(true); // Show success message
      // Optional: Reset form after successful submission?
      // form.reset();
    },
    onError: (error) => { // onError receives the Error object
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error sending your inquiry. Please check your details or try again later.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (formData: InquiryFormValues) => {
    // Prepare data matching the InsertInquiry schema expected by the backend
    const submissionData: InsertInquiry = {
      ...formData, 
      tourId: tourId,
      tourName: tourName, 
    };
    inquiryMutation.mutate(submissionData); // Trigger the mutation with the correct data structure
  };

  // --- Conditional Rendering for Submission Success ---
  if (submitted) {
    return (
      <div className="mt-8"> {/* Added margin top */}
        <h3 className="font-trajan text-xl md:text-2xl text-terracotta mb-4 text-center">Request Information</h3>
        <div className="bg-faded-gold/20 border border-faded-gold p-6 text-center font-garamond rounded shadow-sm">
          <p className="text-lg">Thank you for your inquiry about the "{tourName}" pilgrimage!</p>
          <p className="mt-2">We have received your message and will be in touch via email soon with more details.</p>
        </div>
      </div>
    );
  }

  // --- Render the Form ---
  return (
    <div className="mt-8"> {/* Added margin top */}
      <h3 className="font-trajan text-xl md:text-2xl text-terracotta mb-4 text-center">Request More Information</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Grid for Name and Email fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-garamond text-lg">Your Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Name" className="parchment-input border-faded-gold" disabled={inquiryMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-garamond text-lg">Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com" className="parchment-input border-faded-gold" disabled={inquiryMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-garamond text-lg">Your Inquiry / Questions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5} // Slightly more rows
                    placeholder="Feel free to ask specific questions about dates, customization, or anything else..."
                    className="parchment-input border-faded-gold"
                    disabled={inquiryMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit Button */}
          <div className="text-center pt-2">
            <Button
              type="submit"
              variant="carved" // Assuming this variant exists
              disabled={inquiryMutation.isPending}
              className="min-w-[150px]" // Ensure button has minimum width
            >
              {/* Show loading state */}
              {inquiryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
              ) : (
                "Request Details"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}