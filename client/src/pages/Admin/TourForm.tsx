// client/src/pages/Admin/TourForm.tsx
import { useState, useEffect, useCallback } from "react"; // Removed useRef
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Tour, InsertTour, ItineraryDay } from "@shared/schema";

// Import UI components
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react"; // Removed Upload, CheckCircle, AlertCircle
// import React from 'react'; // No longer needed if Label is removed/imported elsewhere

// --- Import the new ImageUploader component ---
import { ImageUploader } from "./ImageUploader";
// --- Import a standalone Label if needed ---
import { Label } from "@/components/ui/label"; // Or your custom label component

// Zod schema for form validation (imageUrl handled separately)
const tourFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Short description must be at least 10 characters"),
  longDescription: z.string().min(20, "Long description must be at least 20 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.string().min(1, "Difficulty level must be selected"),
  accommodation: z.string().min(1, "Accommodation details are required"),
  groupSize: z.string().min(1, "Group size information is required"),
  price: z.coerce.number().positive("Price must be a positive number").min(1, "Price must be at least 1"),
  featured: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface Props {
  tour?: Tour; // Tour is optional for creation mode
  isOpen: boolean;
  onClose: () => void;
}

const IMAGEKIT_TOUR_FOLDER = "tours"; // Keep constant for passing to uploader

export default function TourForm({ tour, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const isEditing = !!tour; // True if 'tour' prop is provided

  // --- State to hold the final image URL for submission ---
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      title: "", description: "", longDescription: "", location: "", duration: "",
      difficulty: "", accommodation: "", groupSize: "", price: 0, featured: false,
    },
  });

  // Effect to reset form and state when dialog opens or tour changes
  useEffect(() => {
    // Always reset image URL state when dialog opens/changes before setting new value
    setFinalImageUrl(null); // Reset the image URL for the form state

    if (isEditing && tour && isOpen) {
      // Populate form with existing tour data
      form.reset({
        title: tour.title, description: tour.description, longDescription: tour.longDescription,
        location: tour.location, duration: tour.duration, difficulty: tour.difficulty,
        accommodation: tour.accommodation, groupSize: tour.groupSize, price: tour.price,
        featured: tour.featured || false,
      });
      setItineraryDays(tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : [{ day: 1, title: "", description: "" }]);
      // Set the initial image URL for the form state (used for submission and passed to ImageUploader)
      setFinalImageUrl(tour.imageUrl || null);
    } else if (!isEditing && isOpen) {
      // Reset form for creation mode
      form.reset({
          title: "", description: "", longDescription: "", location: "", duration: "",
          difficulty: "", accommodation: "", groupSize: "", price: 0, featured: false,
      });
      setItineraryDays([{ day: 1, title: "", description: "" }]);
      // Ensure no image URL is pre-filled in form state
      setFinalImageUrl(null);
    }
  }, [tour, isOpen, form, isEditing]);

  // --- Removed Image Upload State and Effects ---
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); <-- Replaced by finalImageUrl
  // const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  // const [uploadError, setUploadError] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // useEffect(() => { ... preview logic ... }, [selectedFile]); <-- Moved to ImageUploader

  // --- Itinerary Management Functions (Unchanged) ---
  const addItineraryDay = useCallback(() => { setItineraryDays(prev => [...prev, { day: prev.length + 1, title: "", description: "" }]); }, []);
  const removeItineraryDay = useCallback((indexToRemove: number) => { if (itineraryDays.length <= 1) { toast({ title: "Cannot Remove", description: "A tour must have at least one itinerary day.", variant: "destructive" }); return; } setItineraryDays(prev => prev.filter((_, i) => i !== indexToRemove).map((d, i) => ({ ...d, day: i + 1 }))); }, [itineraryDays.length, toast]);
  const updateItineraryDay = useCallback((indexToUpdate: number, field: keyof Omit<ItineraryDay, 'day'>, value: string) => { setItineraryDays(prev => prev.map((d, i) => i === indexToUpdate ? { ...d, [field]: value } : d)); }, []);

  // --- Removed Image Upload Mutation ---
  // const imageUploadMutation = useMutation<...>({ ... }); <-- Moved to ImageUploader
  // const handleFileChange = (...) => { ... }; <-- Moved to ImageUploader
  // const handleUploadClick = () => { ... }; <-- Moved to ImageUploader

  // --- Form Submission Mutations (Unchanged) ---
  const formMutationOptions = {
    onSuccess: (returnedTourData: Tour) => {
      toast({ title: isEditing ? "Tour Updated" : "Tour Created", description: `Tour "${returnedTourData.title}" saved successfully.` });
      queryClient.invalidateQueries({ queryKey: ['adminTours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featuredTours'] });
      onClose();
    },
    onError: (error: Error) => {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} tour:`, error);
      toast({ title: "Operation Failed", description: error.message || `Could not ${isEditing ? 'update' : 'create'} tour.`, variant: "destructive" });
    },
  };

  const createMutation = useMutation<Tour, Error, InsertTour>({
    mutationFn: (newTourData: InsertTour) => apiRequest<Tour>("POST", "/api/tours", newTourData),
    ...formMutationOptions,
  });

  const updateMutation = useMutation<Tour, Error, { id: number } & Partial<InsertTour>>({
    mutationFn: (updateDataWithId: { id: number } & Partial<InsertTour>) => {
      const { id, ...dataToUpdate } = updateDataWithId;
      return apiRequest<Tour>("PATCH", `/api/tours/${id}`, dataToUpdate);
    },
    ...formMutationOptions,
  });

  // --- Form Submission Handler ---
  const onSubmit = (validatedFormValues: TourFormValues) => {
    const hasInvalidItinerary = itineraryDays.some(day => !day.title?.trim() || !day.description?.trim());
    if (hasInvalidItinerary) { toast({ title: "Itinerary Incomplete", description: "Please fill out title and description for all itinerary days.", variant: "destructive" }); return; }

    // Use the finalImageUrl state directly
    // REQUIRE an image URL if creating a new tour.
    if (!isEditing && !finalImageUrl) {
         toast({ title: "Image Required", description: "Please upload an image before creating the tour.", variant: "destructive" });
         return;
    }

    const submissionData: InsertTour | Partial<InsertTour> = {
        ...validatedFormValues,
        itinerary: itineraryDays,
        // Use the state variable holding the URL from the uploader or initial load
        imageUrl: finalImageUrl || null
    };

    if (isEditing && tour) {
      updateMutation.mutate({ ...(submissionData as Partial<InsertTour>), id: tour.id });
    } else {
      createMutation.mutate(submissionData as InsertTour);
    }
  };

  // Loading states for disabling buttons
  const isFormPending = createMutation.isPending || updateMutation.isPending;
  // Removed isUploading state from here
  // const isUploading = imageUploadMutation.isPending; <-- Removed

  // Disable submit if:
  // 1. Form data is currently being saved (create/update).
  // 2. It's a *new* tour (`!isEditing`) AND no image URL has been set yet (`!finalImageUrl`).
  const isSubmitDisabled = isFormPending || (!isEditing && !finalImageUrl);
  // Disable cancel only if form is submitting
  const isCancelDisabled = isFormPending;

  // --- Component JSX Rendering ---
  if (!isOpen) return null;

  // --- Removed currentImageUrl calculation ---
  // const currentImageUrl = previewUrl || uploadedImageUrl || (isEditing ? tour?.imageUrl : null); <-- No longer needed here

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isFormPending) onClose(); }}>
      {/* Added !isFormPending to onOpenChange to prevent closing during submission */}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-parchment/95 border-monastic-red shadow-xl rounded-lg">
        <DialogHeader className="border-b border-faded-gold pb-3">
          <DialogTitle className="font-trajan text-2xl text-monastic-red">{isEditing ? "Edit Tour Details" : "Create New Tour"}</DialogTitle>
          <DialogDescription>{isEditing ? "Modify the details for this pilgrimage." : "Enter the details for the new pilgrimage."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info Card */}
              <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Form Fields (Unchanged) */}
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Tour Title</FormLabel> <FormControl><Input {...field} placeholder="e.g., Sacred Valleys of Bhutan" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location / Region</FormLabel> <FormControl><Input {...field} placeholder="e.g., Paro, Thimphu & Punakha" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Short Description (for cards)</FormLabel> <FormControl><Textarea {...field} placeholder="A concise overview..." rows={3} className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="longDescription" render={({ field }) => ( <FormItem> <FormLabel>Detailed Description</FormLabel> <FormControl><Textarea {...field} placeholder="Elaborate on the journey..." rows={6} className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />

                  {/* --- Use the ImageUploader Component --- */}
                  <ImageUploader
                    folderName={IMAGEKIT_TOUR_FOLDER}
                    initialImageUrl={finalImageUrl} // Pass the current URL (from state)
                    onUploadSuccess={(url) => {
                      setFinalImageUrl(url); // Update the form's state when upload is successful
                    }}
                    label="Tour Image"
                    className="pt-2" // Add padding if needed
                  />
                  {/* --- Removed Old Image Upload Section --- */}

                </CardContent>
              </Card>

              {/* Tour Details Card (Unchanged) */}
              <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Tour Specifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem> <FormLabel>Duration</FormLabel> <FormControl><Input {...field} placeholder="e.g., 10 Days / 9 Nights" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="difficulty" render={({ field }) => ( <FormItem> <FormLabel>Difficulty Level</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger className="parchment-input border-faded-gold"><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Easy">Easy</SelectItem> <SelectItem value="Moderate">Moderate</SelectItem> <SelectItem value="Challenging">Challenging</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="accommodation" render={({ field }) => ( <FormItem> <FormLabel>Accommodation Style</FormLabel> <FormControl><Input {...field} placeholder="e.g., 3-star hotels & farmstays" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="groupSize" render={({ field }) => ( <FormItem> <FormLabel>Group Size</FormLabel> <FormControl><Input {...field} placeholder="e.g., 2-12 people" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price Per Person (Nu)</FormLabel> <FormControl><Input {...field} type="number" min={1} step={1} placeholder="3200" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="featured" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-faded-gold p-3 shadow-sm bg-parchment/50 mt-6"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="featured-checkbox" /></FormControl> <Label htmlFor="featured-checkbox" className="font-normal cursor-pointer text-sm !mt-0"> Feature this tour on the homepage? </Label> </FormItem> )} />
                </CardContent>
              </Card>
            </div>

            {/* Itinerary Section (Unchanged, assuming Label is imported or defined elsewhere) */}
            <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-faded-gold mb-4"> <CardTitle className="text-lg text-monastic-red font-semibold">Daily Itinerary</CardTitle> <Button type="button" size="sm" variant="outline" onClick={addItineraryDay} className="border-faded-gold hover:bg-faded-gold/20" disabled={isFormPending}> Add Day </Button> </CardHeader>
              <CardContent className="space-y-4">
                {itineraryDays.map((day, index) => (
                  <div key={`itinerary-${index}`} className="p-4 border border-faded-gold rounded-md relative bg-parchment/50 shadow-sm">
                    {itineraryDays.length > 1 && ( <div className="absolute top-2 right-2"> <Button type="button" size="icon" variant="ghost" onClick={() => removeItineraryDay(index)} className="h-7 w-7 text-monastic-red hover:bg-monastic-red/10 rounded-full" aria-label={`Remove Day ${day.day}`} disabled={isFormPending}> <X className="h-4 w-4" /> </Button> </div> )}
                    <h3 className="font-semibold text-monastic-red mb-3">Day {day.day}</h3>
                    <div className="grid grid-cols-1 gap-4">
                       <div> <Label htmlFor={`itinerary-title-${index}`}>Day Title</Label> <Input id={`itinerary-title-${index}`} value={day.title} onChange={(e) => updateItineraryDay(index, 'title', e.target.value)} placeholder="e.g., Hike to Tiger's Nest" className="mt-1 parchment-input border-faded-gold" required disabled={isFormPending} /> </div>
                       <div> <Label htmlFor={`itinerary-desc-${index}`}>Day Description</Label> <Textarea id={`itinerary-desc-${index}`} value={day.description} onChange={(e) => updateItineraryDay(index, 'description', e.target.value)} placeholder="Detail the activities..." rows={4} className="mt-1 parchment-input border-faded-gold" required disabled={isFormPending} /> </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dialog Footer with Action Buttons */}
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline" className="border-faded-gold hover:bg-faded-gold/20" disabled={isCancelDisabled}> Cancel </Button></DialogClose>
              <Button
                type="submit"
                disabled={isSubmitDisabled} // Use the updated disable logic
                className="bg-monastic-red hover:bg-monastic-red/90 text-parchment min-w-[120px]"
              >
                {isFormPending ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> ) : (isEditing ? "Save Changes" : "Create Tour")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Remove the simple Label component definition if you import it from shadcn/ui or another library
// function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
//   return <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{children}</label>;
// }