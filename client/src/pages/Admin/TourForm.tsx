// client/src/pages/Admin/TourForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Tour, insertTourSchema, ItineraryDay } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";

// Define a schema for a tour
const tourSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().min(50, "Long description must be at least 50 characters"),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  accommodation: z.string().min(1, "Accommodation is required"),
  groupSize: z.string().min(1, "Group size is required"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  imageType: z.string().optional(),
  featured: z.boolean().default(false),
  // We'll handle itinerary separately
});

type TourFormValues = z.infer<typeof tourSchema>;

interface Props {
  tour?: Tour;
  isOpen: boolean;
  onClose: () => void;
}

export default function TourForm({ tour, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(
    tour?.itinerary || [{ day: 1, title: "", description: "" }]
  );

  const isEditing = !!tour;

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: tour?.title || "",
      description: tour?.description || "",
      longDescription: tour?.longDescription || "",
      duration: tour?.duration || "",
      difficulty: tour?.difficulty || "",
      accommodation: tour?.accommodation || "",
      groupSize: tour?.groupSize || "",
      price: tour?.price || 0,
      imageType: tour?.imageType || "tigerNest",
      featured: tour?.featured || false,
    },
  });

  const addItineraryDay = () => {
    setItineraryDays([
      ...itineraryDays, 
      { 
        day: itineraryDays.length + 1, 
        title: "", 
        description: "" 
      }
    ]);
  };

  const removeItineraryDay = (index: number) => {
    if (itineraryDays.length > 1) {
      const newDays = [...itineraryDays];
      newDays.splice(index, 1);
      // Re-number the days
      newDays.forEach((day, idx) => {
        day.day = idx + 1;
      });
      setItineraryDays(newDays);
    }
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string | number) => {
    const newDays = [...itineraryDays];
    newDays[index] = { ...newDays[index], [field]: value };
    setItineraryDays(newDays);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tours", data),
    onSuccess: () => {
      toast({
        title: "Tour Created",
        description: "The tour has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating the tour.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/tours/${tour?.id}`, data),
    onSuccess: () => {
      toast({
        title: "Tour Updated",
        description: "The tour has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the tour.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TourFormValues) => {
    // Validate itinerary days
    const hasInvalidItinerary = itineraryDays.some(
      day => !day.title || !day.description
    );

    if (hasInvalidItinerary) {
      toast({
        title: "Validation Error",
        description: "Please fill out all itinerary fields.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      ...values,
      itinerary: itineraryDays
    };

    if (isEditing && tour) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-parchment/95">
        <DialogHeader>
          <DialogTitle className="font-trajan text-2xl text-monastic-red">
            {isEditing ? "Edit Tour" : "Create New Tour"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card className="border-faded-gold">
                <CardHeader>
                  <CardTitle className="text-lg text-monastic-red">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tiger's Nest Pilgrimage" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="A brief overview of the tour..."
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="A detailed description of the tour..."
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tour Details */}
              <Card className="border-faded-gold">
                <CardHeader>
                  <CardTitle className="text-lg text-monastic-red">Tour Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="7 Days / 6 Nights" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="Challenging">Challenging</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accommodation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Heritage hotels and traditional farmhouses" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Size</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Maximum 12 pilgrims" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} placeholder="2850" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select image type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tigerNest">Tiger's Nest</SelectItem>
                            <SelectItem value="bumthang">Bumthang</SelectItem>
                            <SelectItem value="drukPath">Druk Path</SelectItem>
                            <SelectItem value="dzong">Dzong</SelectItem>
                            <SelectItem value="mountains">Mountains</SelectItem>
                            <SelectItem value="prayerFlags">Prayer Flags</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-faded-gold p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Featured Tour (show on homepage)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Itinerary */}
            <Card className="border-faded-gold">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-monastic-red">Itinerary</CardTitle>
                <Button 
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addItineraryDay}
                  className="border-faded-gold"
                >
                  Add Day
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {itineraryDays.map((day, index) => (
                  <div key={index} className="p-3 border border-faded-gold rounded-md relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItineraryDay(index)}
                        disabled={itineraryDays.length === 1}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-trajan text-monastic-red mb-3">Day {day.day}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FormLabel>Title</FormLabel>
                        <Input
                          value={day.title}
                          onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                          placeholder="Arrival in Paro"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={day.description}
                          onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                          placeholder="Description of activities for the day..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="border-faded-gold">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? "Update Tour" : "Create Tour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}