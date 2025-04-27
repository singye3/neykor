// client/src/components/contact/ContactForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
// Import necessary types - ensure InsertContact includes optional phone
import type { ContactMessage, InsertContact } from "@shared/schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react"; // Import Loader

// --- UPDATED Zod schema ---
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional(), // Added optional phone field
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
// --- End Update ---

// Type derived from the Zod schema
type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Initialize React Hook Form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    // --- UPDATED defaultValues ---
    defaultValues: {
      name: "",
      email: "",
      phone: "", // Initialize phone
      subject: "",
      message: "",
    },
    // --- End Update ---
  });

  // Setup contact message mutation using React Query
  // Ensure InsertContact type includes optional phone
  const contactMutation = useMutation<ContactMessage, Error, InsertContact>({
    mutationFn: async (data: InsertContact) => {
        // apiRequest handles fetch, error checks, and JSON parsing
        return apiRequest<ContactMessage>("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We will respond as soon as possible.",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (formData: ContactFormValues) => {
    // formData now includes optional 'phone' based on the updated schema
    // Assuming InsertContact type in @shared/schema is also updated
    const submissionData: InsertContact = {
      ...formData,
    };
    contactMutation.mutate(submissionData);
  };

  // --- Conditional Rendering for Submission Success ---
  if (submitted) {
    return (
      <div className="bg-faded-gold/20 border border-faded-gold p-6 text-center font-garamond rounded shadow-sm">
        <p className="text-lg">Thank you!</p>
        <p className="mt-2">Your message has been sent successfully. We will be in touch soon.</p>
      </div>
    );
  }

  // --- Render the Form ---
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-garamond text-lg">Your Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full Name" className="parchment-input border-faded-gold" disabled={contactMutation.isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-garamond text-lg">Email Address</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="you@example.com" className="parchment-input border-faded-gold" disabled={contactMutation.isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- ADDED Phone Number Field --- */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-garamond text-lg">Phone Number (Optional)</FormLabel>
              <FormControl>
                {/* Using type="tel" for better mobile experience */}
                <Input {...field} type="tel" placeholder="Your phone number" className="parchment-input border-faded-gold" disabled={contactMutation.isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- End Add --- */}

        {/* Subject Field */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-garamond text-lg">Subject</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Ensure value is bound
                disabled={contactMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger className="parchment-input border-faded-gold">
                    <SelectValue placeholder="-- Select a Subject --" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Tour Inquiry">Tour Inquiry</SelectItem>
                  <SelectItem value="Custom Pilgrimage Request">Custom Pilgrimage Request</SelectItem>
                  <SelectItem value="Travel Logistics Question">Travel Logistics Question</SelectItem>
                  <SelectItem value="Feedback or Suggestion">Feedback or Suggestion</SelectItem>
                  <SelectItem value="Other Inquiry">Other Inquiry</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Message Field */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-garamond text-lg">Your Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  placeholder="Please provide details about your inquiry..."
                  className="parchment-input border-faded-gold"
                  disabled={contactMutation.isPending}
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
            disabled={contactMutation.isPending}
            className="min-w-[150px]" // Ensure consistent button size
          >
            {contactMutation.isPending ? (
                 <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                 </>
             ) : (
                "Send Message"
             )}
          </Button>
        </div>
      </form>
    </Form>
  );
}