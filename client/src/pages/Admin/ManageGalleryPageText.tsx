// client/src/pages/Admin/ManageGalleryPageText.tsx

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient"; // Use updated apiRequest
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { GalleryPageSettings, InsertGalleryPageSettings, upsertGalleryPageSettingsSchema } from "@shared/schema";

// Removed separate fetchAdminGallerySettings function

// Form values type based on the Zod schema for inserts/updates
type GalleryPageFormValues = InsertGalleryPageSettings;

export default function ManageGalleryPageText() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current settings to populate the form using useQuery and apiRequest directly
    const { data: currentSettings, isLoading, isError, error } = useQuery<GalleryPageSettings, Error>({
        queryKey: ['adminGalleryPageSettings'], // Unique query key for admin data
        // --- UPDATED queryFn ---
        queryFn: () => apiRequest<GalleryPageSettings>("GET", "/api/content/gallery"),
        // --- End Update ---
        staleTime: 1000 * 60, // Cache settings for 1 minute in admin panel
        refetchOnWindowFocus: true,
    });

    // Initialize React Hook Form
    const form = useForm<GalleryPageFormValues>({
        resolver: zodResolver(upsertGalleryPageSettingsSchema), // Use Zod schema for validation
        defaultValues: { // Set defaults (will be overridden by useEffect)
            pageHeading: "",
            pageParagraph: "",
        },
    });

    // Populate form with fetched data once available
    useEffect(() => {
        if (currentSettings) {
            form.reset(currentSettings); // Update form values and reset dirty state
        }
    }, [currentSettings, form]); // Dependencies

    // Mutation for updating the settings via PATCH request
    const updateMutation = useMutation<GalleryPageSettings, Error, GalleryPageFormValues>({
        // --- UPDATED mutationFn ---
        mutationFn: async (data: GalleryPageFormValues) => {
            // Use apiRequest which returns parsed JSON or throws error
            return apiRequest<GalleryPageSettings>("PATCH", "/api/content/gallery", data);
        },
        // --- End Update ---
        onSuccess: (updatedData) => {
            toast({ title: "Settings Updated", description: "Gallery page text saved successfully." });
            // Update the cache for this admin page query directly
            queryClient.setQueryData(['adminGalleryPageSettings'], updatedData);
            // Invalidate the cache for the public query to force refetch on next visit
            queryClient.invalidateQueries({ queryKey: ['galleryPageSettings'] }); // Assuming this is the public key
            // Reset the form with the newly saved data to clear dirty state
            form.reset(updatedData);
        },
        onError: (err) => { // err should be the Error thrown by apiRequest or network issues
            console.error("Gallery Page Text Update Mutation Error:", err);
            // Check if the error message looks like HTML (less likely now with apiRequest fix)
            // const looksLikeHtml = err.message?.trim().startsWith('<');
            // const displayMessage = looksLikeHtml
            //     ? "Server returned an unexpected response. Check network tab and server logs."
            //     : err.message || "Could not save changes due to an unknown error.";

            toast({
                title: "Update Failed",
                description: err.message || "Could not save changes. Please try again.",
                variant: "destructive",
                // duration: 7000, // Optional longer duration
            });
        },
    });

    // Function to handle form submission
    const onSubmit = (data: GalleryPageFormValues) => {
        // console.log("Submitting gallery page text data:", data); // Keep for debugging if needed
        updateMutation.mutate(data); // Trigger the mutation
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
                    <span className="font-garamond">Manage Gallery Page Text</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit Gallery Page Text</h2>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Loader /></div>
                ) : isError ? (
                    // Error State
                    <div className="text-center text-destructive py-8 border border-destructive bg-red-100 p-4 rounded max-w-xl mx-auto">
                       <h3 className="font-semibold text-lg mb-2">Error Loading Settings</h3>
                       <p>{error?.message || "Could not load current gallery page settings."}</p>
                    </div>
                ) : (
                    // Form Display State
                     <Card className="border-faded-gold bg-parchment/50 max-w-3xl mx-auto shadow-sm">
                         <CardHeader>
                            <CardTitle className="text-lg text-monastic-red font-semibold">Page Introduction</CardTitle>
                         </CardHeader>
                         <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Page Heading Field */}
                                    <FormField
                                        control={form.control}
                                        name="pageHeading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Page Heading</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Sacred Visions of Bhutan" className="parchment-input border-faded-gold" />
                                                </FormControl>
                                                <FormMessage /> {/* Displays Zod validation errors */}
                                            </FormItem>
                                        )}
                                    />
                                    {/* Introductory Paragraph Field */}
                                     <FormField
                                        control={form.control}
                                        name="pageParagraph"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Introductory Paragraph</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={6} placeholder="Enter the introductory text for the gallery page..." className="parchment-input border-faded-gold" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     {/* Submit Button Area */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            // Disable if mutation is pending OR if form hasn't been changed
                                            disabled={updateMutation.isPending || !form.formState.isDirty}
                                            size="lg"
                                            className="min-w-[150px]" // Ensure button min width
                                        >
                                            {/* Use updateMutation.isPending */}
                                            {updateMutation.isPending ? (
                                                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                                            ) : ( "Save Gallery Text" )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}