import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface TourInquiryFormProps {
  tourId: string;
  tourName: string;
}

export default function TourInquiryForm({ tourId, tourName }: TourInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      message: `I'm interested in the ${tourName} pilgrimage. Please send me more information.`,
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: (data: InquiryFormValues) => 
      apiRequest("POST", "/api/inquiries", { 
        ...data,
        tourId: parseInt(tourId),
      }),
    onSuccess: () => {
      toast({
        title: "Inquiry Sent",
        description: "Thank you for your interest. We will respond to you soon.",
      });
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error sending your inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InquiryFormValues) => {
    inquiryMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div>
        <h3 className="font-trajan text-2xl text-terracotta mb-4">Request Information</h3>
        <div className="bg-faded-gold/20 border border-faded-gold p-4 text-center font-garamond">
          <p>Thank you for your inquiry. We will respond to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-trajan text-2xl text-terracotta mb-4">Request Information</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-garamond text-lg">Your Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="parchment-input" disabled={inquiryMutation.isPending} />
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
                    <Input {...field} type="email" className="parchment-input" disabled={inquiryMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-garamond text-lg">Your Inquiry</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={4} 
                    className="parchment-input" 
                    disabled={inquiryMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-center">
            <Button 
              type="submit" 
              variant="carved"
              disabled={inquiryMutation.isPending}
            >
              {inquiryMutation.isPending ? "Sending..." : "Request Details"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
