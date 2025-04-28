// client/src/pages/Admin/TourForm.tsx
import { useState, useEffect, useRef, useCallback } from "react";
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
import { Loader2, X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import React from 'react'; // Import React for Label component

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

const IMAGEKIT_TOUR_FOLDER = "tours";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function TourForm({ tour, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const isEditing = !!tour; // True if 'tour' prop is provided

  // --- Image Upload State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Initialize with existing tour image URL if editing, otherwise null
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    // Default values ensure controlled components
    defaultValues: {
      title: "", description: "", longDescription: "", location: "", duration: "",
      difficulty: "", accommodation: "", groupSize: "", price: 0, featured: false,
    },
  });

  // Effect to reset form and state when dialog opens or tour changes
  useEffect(() => {
    // Always reset image selection/upload state when dialog opens/changes
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setUploadError(null);

    if (isEditing && tour && isOpen) {
      // Populate form with existing tour data
      form.reset({
        title: tour.title, description: tour.description, longDescription: tour.longDescription,
        location: tour.location, duration: tour.duration, difficulty: tour.difficulty,
        accommodation: tour.accommodation, groupSize: tour.groupSize, price: tour.price,
        featured: tour.featured || false,
      });
      // Populate itinerary or set a default first day
      setItineraryDays(tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : [{ day: 1, title: "", description: "" }]);
      // Set the initial uploaded image URL to the existing tour's image URL
      setUploadedImageUrl(tour.imageUrl || null);
    } else if (!isEditing && isOpen) {
      // Reset form for creation mode
      form.reset({ // Explicitly reset to default values
          title: "", description: "", longDescription: "", location: "", duration: "",
          difficulty: "", accommodation: "", groupSize: "", price: 0, featured: false,
      });
      // Set a default first itinerary day
      setItineraryDays([{ day: 1, title: "", description: "" }]);
      // Ensure no image URL is pre-filled
      setUploadedImageUrl(null);
    }
    // Only run when these dependencies change
  }, [tour, isOpen, form, isEditing]);

  // Effect for creating/revoking object URLs for local image preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return; // No file selected, do nothing
    }
    // Create a temporary local URL for the selected file
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function: revoke the object URL when the component unmounts or the file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]); // Rerun only when selectedFile changes

  // --- Itinerary Management Functions ---
  const addItineraryDay = useCallback(() => { setItineraryDays(prev => [...prev, { day: prev.length + 1, title: "", description: "" }]); }, []);
  const removeItineraryDay = useCallback((indexToRemove: number) => { if (itineraryDays.length <= 1) { toast({ title: "Cannot Remove", description: "A tour must have at least one itinerary day.", variant: "destructive" }); return; } setItineraryDays(prev => prev.filter((_, i) => i !== indexToRemove).map((d, i) => ({ ...d, day: i + 1 }))); }, [itineraryDays.length, toast]);
  const updateItineraryDay = useCallback((indexToUpdate: number, field: keyof Omit<ItineraryDay, 'day'>, value: string) => { setItineraryDays(prev => prev.map((d, i) => i === indexToUpdate ? { ...d, [field]: value } : d)); }, []);

  // --- Image Upload Mutation ---
  const imageUploadMutation = useMutation<
    { url: string; filePath: string; fileId: string; name: string }, // Success response type
    Error, // Error type
    File // Input type (the file to upload)
  >({
    mutationFn: async (file: File) => {
      setUploadStatus('uploading');
      setUploadError(null);
      const formData = new FormData();
      formData.append('imageFile', file);
      formData.append('folderName', IMAGEKIT_TOUR_FOLDER);

      // Make the API call to your backend upload endpoint
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Send cookies if needed for auth
      });

      if (!response.ok) {
        let errorMsg = `Upload failed (${response.status})`;
        try { const errBody = await response.json(); errorMsg = errBody.message || JSON.stringify(errBody); } catch (e) { /* Ignore JSON parsing error */ }
        throw new Error(errorMsg);
      }
      return response.json(); // Parse successful JSON response
    },
    onSuccess: (data) => {
      setUploadedImageUrl(data.url); // Store the URL from the backend
      setUploadStatus('success');
      setSelectedFile(null); // Clear selected file state
      setPreviewUrl(null); // Clear preview
      toast({ title: "Image Uploaded", description: `File ${data.name} ready.` });
    },
    onError: (error) => {
      setUploadStatus('error');
      setUploadError(error.message);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });

  // Handler for file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       // Validate file size and type
       if (file.size > MAX_FILE_SIZE) { toast({ title: "File Too Large", description: `Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, variant: "destructive" }); return; }
       if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { toast({ title: "Invalid File Type", description: "Please select a JPEG, PNG, WEBP, or GIF.", variant: "destructive" }); return; }
      // Update state for the newly selected file
      setSelectedFile(file);
      // If a user selects a new file, assume they want to replace the existing/uploaded one.
      // Keep uploadedImageUrl UNTIL the new one successfully uploads in imageUploadMutation.onSuccess
      // But reset the *status* to allow uploading the new file.
      setUploadStatus('idle');
      setUploadError(null);
    }
  };

  // Handler for triggering the actual upload via the mutation
  const handleUploadClick = () => {
    if (selectedFile) {
      imageUploadMutation.mutate(selectedFile);
    }
  };

  // --- Form Submission Mutations (Create/Update Tour Details) ---
  const formMutationOptions = {
    onSuccess: (returnedTourData: Tour) => {
      toast({ title: isEditing ? "Tour Updated" : "Tour Created", description: `Tour "${returnedTourData.title}" saved successfully.` });
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['adminTours'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['featuredTours'] }); // Invalidate featured if using separate query
      onClose(); // Close the dialog
    },
    onError: (error: Error) => {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} tour:`, error);
      toast({ title: "Operation Failed", description: error.message || `Could not ${isEditing ? 'update' : 'create'} tour.`, variant: "destructive" });
    },
  };

  // Mutation for creating a new tour
  const createMutation = useMutation<Tour, Error, InsertTour>({
    mutationFn: (newTourData: InsertTour) => apiRequest<Tour>("POST", "/api/tours", newTourData),
    ...formMutationOptions,
  });

  // Mutation for updating an existing tour
  const updateMutation = useMutation<Tour, Error, { id: number } & Partial<InsertTour>>({
    mutationFn: (updateDataWithId: { id: number } & Partial<InsertTour>) => {
      const { id, ...dataToUpdate } = updateDataWithId; // Separate ID from data
      return apiRequest<Tour>("PATCH", `/api/tours/${id}`, dataToUpdate);
    },
    ...formMutationOptions,
  });

  // --- Form Submission Handler ---
  const onSubmit = (validatedFormValues: TourFormValues) => {
    // Validate itinerary fields
    const hasInvalidItinerary = itineraryDays.some(day => !day.title?.trim() || !day.description?.trim());
    if (hasInvalidItinerary) { toast({ title: "Itinerary Incomplete", description: "Please fill out title and description for all itinerary days.", variant: "destructive" }); return; }

    // Determine the final image URL to submit
    // Priority: Newly uploaded > Original tour image (if editing) > null
    const finalImageUrl = uploadedImageUrl || (isEditing ? tour?.imageUrl : null);

    // REQUIRE an image URL if creating a new tour.
    if (!isEditing && !finalImageUrl) {
         toast({ title: "Image Required", description: "Please upload an image before creating the tour.", variant: "destructive" });
         return;
    }

    // Prepare the full data payload for submission
    const submissionData: InsertTour | Partial<InsertTour> = {
        ...validatedFormValues,
        itinerary: itineraryDays,
        imageUrl: finalImageUrl || null // Ensure it's explicitly null if no image
    };

    // Call the appropriate mutation based on editing mode
    if (isEditing && tour) {
      // Include the ID for the update mutation
      updateMutation.mutate({ ...(submissionData as Partial<InsertTour>), id: tour.id });
    } else {
      // Use the create mutation
      createMutation.mutate(submissionData as InsertTour);
    }
  };

  // Loading states for disabling buttons
  const isFormPending = createMutation.isPending || updateMutation.isPending;
  const isUploading = imageUploadMutation.isPending;

  // --- FIX FOR ts(2339) ---
  // Calculate the disabled state for the submit button separately for clarity.
  // Disable if:
  // 1. Image is currently uploading.
  // 2. Form data is currently being saved (create/update).
  // 3. It's a *new* tour (`!isEditing`) AND no image has been successfully uploaded yet (`!uploadedImageUrl`).
  const isSubmitDisabled = isUploading || isFormPending || (!isEditing && !uploadedImageUrl);
  // -------------------------

  // --- Component JSX Rendering ---
  if (!isOpen) return null; // Don't render anything if the dialog is closed

  // Determine the image URL to display (preview > uploaded/existing)
  const currentImageUrl = previewUrl || uploadedImageUrl || (isEditing ? tour?.imageUrl : null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-parchment/95 border-monastic-red shadow-xl rounded-lg">
        <DialogHeader className="border-b border-faded-gold pb-3">
          <DialogTitle className="font-trajan text-2xl text-monastic-red">{isEditing ? "Edit Tour Details" : "Create New Tour"}</DialogTitle>
          <DialogDescription>{isEditing ? "Modify the details for this pilgrimage." : "Enter the details for the new pilgrimage."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* Use handleSubmit from react-hook-form to handle validation */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info Card */}
              <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Form Fields using ShadCN Form components */}
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Tour Title</FormLabel> <FormControl><Input {...field} placeholder="e.g., Sacred Valleys of Bhutan" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location / Region</FormLabel> <FormControl><Input {...field} placeholder="e.g., Paro, Thimphu & Punakha" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Short Description (for cards)</FormLabel> <FormControl><Textarea {...field} placeholder="A concise overview..." rows={3} className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="longDescription" render={({ field }) => ( <FormItem> <FormLabel>Detailed Description</FormLabel> <FormControl><Textarea {...field} placeholder="Elaborate on the journey..." rows={6} className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />

                  {/* Image Upload Section */}
                  <div className="space-y-3 pt-2">
                     <FormLabel>Tour Image</FormLabel>
                     {/* Display current image preview */}
                     {currentImageUrl && (
                       <div className="mt-2 mb-2 border border-faded-gold rounded p-2 inline-block">
                         <img src={currentImageUrl} alt="Current tour preview" className="max-h-40 max-w-full rounded" />
                       </div>
                     )}
                     {/* Hidden file input, triggered by button */}
                     <Input id="tour-image-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept={ACCEPTED_IMAGE_TYPES.join(",")} className="hidden" />

                     {/* Button to trigger file selection */}
                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="border-faded-gold text-sm">
                         {currentImageUrl ? "Change Image" : "Select Image"}
                     </Button>

                     {/* Display selected file info and Upload button (only if file selected and not successfully uploaded yet) */}
                     {selectedFile && uploadStatus !== 'success' && (
                         <div className="flex items-center gap-3 mt-2 text-sm">
                             <span>Selected: {selectedFile.name}</span>
                             <Button
                                type="button"
                                size="sm"
                                onClick={handleUploadClick}
                                disabled={isUploading} // Disable only if actively uploading
                                className="bg-terracotta hover:bg-terracotta/90 text-white"
                              >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                                Upload
                             </Button>
                         </div>
                     )}

                     {/* Status Indicators */}
                     {uploadStatus === 'uploading' && <p className="text-sm text-blue-600 flex items-center gap-1 mt-2"><Loader2 className="h-4 w-4 animate-spin"/>Uploading...</p>}
                     {uploadStatus === 'success' && <p className="text-sm text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4"/>Upload successful! Image ready.</p>}
                     {uploadStatus === 'error' && <p className="text-sm text-destructive flex items-center gap-1 mt-2"><AlertCircle className="h-4 w-4"/>Error: {uploadError}</p>}
                   </div>
                </CardContent>
              </Card>

              {/* Tour Details Card */}
              <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Tour Specifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* More Form Fields */}
                  <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem> <FormLabel>Duration</FormLabel> <FormControl><Input {...field} placeholder="e.g., 10 Days / 9 Nights" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="difficulty" render={({ field }) => ( <FormItem> <FormLabel>Difficulty Level</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger className="parchment-input border-faded-gold"><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Easy">Easy</SelectItem> <SelectItem value="Moderate">Moderate</SelectItem> <SelectItem value="Challenging">Challenging</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="accommodation" render={({ field }) => ( <FormItem> <FormLabel>Accommodation Style</FormLabel> <FormControl><Input {...field} placeholder="e.g., 3-star hotels & farmstays" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="groupSize" render={({ field }) => ( <FormItem> <FormLabel>Group Size</FormLabel> <FormControl><Input {...field} placeholder="e.g., 2-12 people" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price Per Person (Nu)</FormLabel> <FormControl><Input {...field} type="number" min={1} step={1} placeholder="3200" className="parchment-input border-faded-gold" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="featured" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-faded-gold p-3 shadow-sm bg-parchment/50 mt-6"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="featured-checkbox" /></FormControl> <FormLabel htmlFor="featured-checkbox" className="font-normal cursor-pointer text-sm !mt-0"> Feature this tour on the homepage? </FormLabel> </FormItem> )} />
                </CardContent>
              </Card>
            </div>

            {/* Itinerary Section */}
            <Card className="border-faded-gold bg-parchment/70 shadow-md rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-faded-gold mb-4"> <CardTitle className="text-lg text-monastic-red font-semibold">Daily Itinerary</CardTitle> <Button type="button" size="sm" variant="outline" onClick={addItineraryDay} className="border-faded-gold hover:bg-faded-gold/20"> Add Day </Button> </CardHeader>
              <CardContent className="space-y-4">
                {itineraryDays.map((day, index) => (
                  <div key={`itinerary-${index}`} className="p-4 border border-faded-gold rounded-md relative bg-parchment/50 shadow-sm">
                    {/* Show remove button only if more than one day exists */}
                    {itineraryDays.length > 1 && ( <div className="absolute top-2 right-2"> <Button type="button" size="icon" variant="ghost" onClick={() => removeItineraryDay(index)} className="h-7 w-7 text-monastic-red hover:bg-monastic-red/10 rounded-full" aria-label={`Remove Day ${day.day}`}> <X className="h-4 w-4" /> </Button> </div> )}
                    <h3 className="font-semibold text-monastic-red mb-3">Day {day.day}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Itinerary day title */}
                      <div> <Label htmlFor={`itinerary-title-${index}`}>Day Title</Label> <Input id={`itinerary-title-${index}`} value={day.title} onChange={(e) => updateItineraryDay(index, 'title', e.target.value)} placeholder="e.g., Hike to Tiger's Nest" className="mt-1 parchment-input border-faded-gold" required /> </div>
                      {/* Itinerary day description */}
                      <div> <Label htmlFor={`itinerary-desc-${index}`}>Day Description</Label> <Textarea id={`itinerary-desc-${index}`} value={day.description} onChange={(e) => updateItineraryDay(index, 'description', e.target.value)} placeholder="Detail the activities..." rows={4} className="mt-1 parchment-input border-faded-gold" required /> </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dialog Footer with Action Buttons */}
            <DialogFooter className="pt-6">
              {/* Cancel button closes the dialog */}
              <DialogClose asChild><Button type="button" variant="outline" className="border-faded-gold hover:bg-faded-gold/20" disabled={isUploading || isFormPending}> Cancel </Button></DialogClose>
              {/* Submit button triggers form submission */}
              <Button
                type="submit"
                // Use the calculated disabled state
                disabled={isSubmitDisabled}
                className="bg-monastic-red hover:bg-monastic-red/90 text-parchment min-w-[120px]"
              >
                {/* Show loading state or appropriate text */}
                {isFormPending ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> ) : (isEditing ? "Save Changes" : "Create Tour")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Simple Label component
function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{children}</label>;
}