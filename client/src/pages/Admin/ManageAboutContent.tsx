// client/src/pages/Admin/ManageAboutContent.tsx
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// --- Use the correct shared path for ImageUploader ---
import { ImageUploader } from "./ImageUploader";
// --- END ---

// Import the schema and types
import { AboutPageContent, InsertAboutPageContent, upsertAboutPageContentSchema } from "@shared/schema";

// Define the form values type based on the schema
type AboutPageFormValues = InsertAboutPageContent;

// --- Define a constant for the upload folder ---
const ABOUT_IMAGE_FOLDER = "about";
// --- END ---

export default function ManageAboutContent() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current content
    const { data: currentContent, isLoading: isLoadingContent, isError, error } = useQuery<AboutPageContent, Error>({
        queryKey: ['aboutContentAdmin'],
        queryFn: () => apiRequest<AboutPageContent>("GET", "/api/content/about"),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
    });

    // Initialize React Hook Form
    const form = useForm<AboutPageFormValues>({
        resolver: zodResolver(upsertAboutPageContentSchema),
        // Align with schema, using undefined for optional fields
        defaultValues: {
            mainHeading: "",
            imageUrl: undefined, // Use undefined if optional in schema
            imageAlt: "",
            historyText: "",
            missionText: "",
            philosophyHeading: "",
            philosophyQuote: "",
            value1Title: "", value1Text: "",
            value2Title: "", value2Text: "",
            value3Title: "", value3Text: "",
        },
    });

    // Populate form with fetched data
    useEffect(() => {
        if (currentContent) {
            // Reset form, ensuring undefined for potentially missing/empty URL
            form.reset({
                ...currentContent,
                imageUrl: currentContent.imageUrl || undefined, // Handle empty string or null
            });
        }
    }, [currentContent, form]);

    // Mutation for updating content
    const updateMutation = useMutation<AboutPageContent, Error, AboutPageFormValues>({
        mutationFn: async (data: AboutPageFormValues) => {
            // Data should conform to schema (string | undefined for imageUrl)
            return apiRequest<AboutPageContent>("PATCH", "/api/content/about", data);
        },
        onSuccess: (updatedData) => {
            toast({
                title: "Content Updated",
                description: "The About Us page content has been saved successfully.",
            });
             // Reset form with updated data, using undefined for missing URL
            const resetData = {
                ...updatedData,
                imageUrl: updatedData.imageUrl || undefined, // Handle empty string or null
            };
            queryClient.setQueryData(['aboutContentAdmin'], resetData);
            queryClient.invalidateQueries({ queryKey: ['aboutContent'] });
            form.reset(resetData);
        },
        onError: (error: Error) => {
             console.error("Error updating about content:", error);
            toast({
                title: "Update Failed",
                description: error.message || "Could not save changes. Please check the console and try again.",
                variant: "destructive",
            });
        },
    });

    // Form submission handler
    const onSubmit = (data: AboutPageFormValues) => {
         // Ensure empty strings become undefined before sending if needed by backend/schema
         // (Assuming schema treats empty string as invalid for optional URL)
        const dataToSend = {
             ...data,
             imageUrl: data.imageUrl || undefined,
         };
        updateMutation.mutate(dataToSend);
    };

    // --- Watch the imageUrl field for the ImageUploader ---
    const watchedImageUrl = form.watch('imageUrl');
    // --- END ---

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
                    <span className="font-garamond">Manage About Us Content</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit About Us Page</h2>

                {isLoadingContent ? (
                    <div className="flex justify-center py-16"><Loader /></div>
                ) : isError ? (
                     <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-2xl mx-auto">
                        <h3 className="font-semibold text-lg mb-2">Error Loading Content</h3>
                        <p>{error?.message || "Could not load the current content. Please refresh or try again later."}</p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                            {/* Main Section Card */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Main Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="mainHeading" render={({ field }) => ( <FormItem><FormLabel>Main Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Our Sacred Journey" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />

                                    {/* --- UPDATED: ImageUploader Integration using form.watch/setValue --- */}
                                    <ImageUploader
                                        folderName={ABOUT_IMAGE_FOLDER}
                                        initialImageUrl={watchedImageUrl} // Use watched value (string | undefined)
                                        onUploadSuccess={(url) => {
                                            // Use setValue to update form state for 'imageUrl'
                                            form.setValue('imageUrl', url, {
                                                shouldDirty: true, // Mark form as dirty
                                                shouldValidate: true // Trigger validation for the field
                                            });
                                        }}
                                        label="Main Image" // Use internal label of ImageUploader
                                        className="mt-2"
                                    />
                                    {/* Separate FormField for displaying validation messages for imageUrl */}
                                    <FormField
                                        control={form.control}
                                        name="imageUrl" // Link to the correct field name
                                        render={() => (
                                            <FormItem className="mt-0 pt-0"> {/* Adjust spacing if needed */}
                                                {/* Label is handled by ImageUploader above */}
                                                {/* Only render the message component */}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* --- END UPDATE --- */}

                                    <FormField control={form.control} name="imageAlt" render={({ field }) => ( <FormItem><FormLabel>Image Alt Text (for accessibility)</FormLabel><FormControl><Input {...field} placeholder="Describe the image" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="historyText" render={({ field }) => ( <FormItem><FormLabel>History Paragraph</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Describe the company history..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="missionText" render={({ field }) => ( <FormItem><FormLabel>Mission Paragraph</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Describe the company mission..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                </CardContent>
                            </Card>

                            {/* Philosophy Section Card */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Philosophy Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="philosophyHeading" render={({ field }) => ( <FormItem><FormLabel>Philosophy Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Our Guiding Principles" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="philosophyQuote" render={({ field }) => ( <FormItem><FormLabel>Philosophy Quote</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="Enter the central quote..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                </CardContent>
                            </Card>

                            {/* Values Section Card */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Core Values Section</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Value 1 */}
                                    <div className="space-y-2 border border-faded-gold/50 p-4 rounded bg-parchment/70">
                                        <FormField control={form.control} name="value1Title" render={({ field }) => ( <FormItem><FormLabel>Value 1 Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Authenticity" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value1Text" render={({ field }) => ( <FormItem><FormLabel>Value 1 Text</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Describe the first value..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    {/* Value 2 */}
                                     <div className="space-y-2 border border-faded-gold/50 p-4 rounded bg-parchment/70">
                                        <FormField control={form.control} name="value2Title" render={({ field }) => ( <FormItem><FormLabel>Value 2 Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Respect" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value2Text" render={({ field }) => ( <FormItem><FormLabel>Value 2 Text</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Describe the second value..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    {/* Value 3 */}
                                     <div className="space-y-2 border border-faded-gold/50 p-4 rounded bg-parchment/70">
                                        <FormField control={form.control} name="value3Title" render={({ field }) => ( <FormItem><FormLabel>Value 3 Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Insight" className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value3Text" render={({ field }) => ( <FormItem><FormLabel>Value 3 Text</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Describe the third value..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end mt-8">
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending || !form.formState.isDirty} // Disable if pending or no changes
                                    className="min-w-[120px]" // Give button min width
                                >
                                    {updateMutation.isPending ? (
                                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}