// client/src/pages/Admin/ManageHomePage.tsx
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { HomePageContent, InsertHomePageContent, upsertHomePageContentSchema } from "@shared/schema";

// Removed separate fetchHomePageContentAdmin function

// Define the form values type based on the schema
type HomePageFormValues = InsertHomePageContent;

export default function ManageHomePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current content using useQuery and apiRequest directly
    const { data: currentContent, isLoading, isError, error } = useQuery<HomePageContent, Error>({
        queryKey: ['homeContentAdmin'], // Separate key for admin maybe
        // --- UPDATED queryFn ---
        queryFn: () => apiRequest<HomePageContent>("GET", "/api/content/home"),
        // --- End Update ---
        staleTime: 1000 * 60, // Keep admin data fresh for 1 minute
        refetchOnWindowFocus: true,
    });

    // Initialize React Hook Form
    const form = useForm<HomePageFormValues>({
        resolver: zodResolver(upsertHomePageContentSchema),
        // Set initial defaults (important for controlled components)
        // These will be overridden by useEffect when data loads
        defaultValues: {
            heroImageURL: "", heroImageAlt: "", heroHeadingLine1: "", heroHeadingLine2: "",
            heroParagraph: "", heroButtonText: "", introHeading: "", introParagraph1: "",
            introParagraph2: "", featuredHeading: "", featuredMapURL: "", featuredMapAlt: "",
            featuredMapCaption: "", featuredButtonText: "", carouselHeading: "", whyHeading: "",
            why1Icon: "", why1Title: "", why1Text: "", why2Icon: "", why2Title: "", why2Text: "",
            why3Icon: "", why3Title: "", why3Text: "", testimonialsHeading: "",
        },
    });

    // Populate form once data is loaded
    useEffect(() => {
        if (currentContent) {
            form.reset(currentContent); // Reset form with fetched data
        }
    }, [currentContent, form]); // Dependencies

    // Mutation for updating content
    const updateMutation = useMutation<HomePageContent, Error, HomePageFormValues>({
         // --- UPDATED mutationFn ---
        mutationFn: async (data: HomePageFormValues) => {
            // Use apiRequest directly, which returns parsed JSON or throws
            return apiRequest<HomePageContent>("PATCH", "/api/content/home", data);
        },
        // --- End Update ---
        onSuccess: (updatedData) => {
            toast({ title: "Content Updated", description: "Home page content saved successfully." });
            queryClient.setQueryData(['homeContentAdmin'], updatedData); // Update admin cache instantly
            queryClient.invalidateQueries({ queryKey: ['homeContent'] }); // Invalidate public cache
            form.reset(updatedData); // Reset form with new data to clear dirty state
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message || "Could not save changes.", variant: "destructive" });
        },
    });

    // Form submission handler
    const onSubmit = (data: HomePageFormValues) => {
        updateMutation.mutate(data); // Trigger mutation
    };

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
                    <span className="font-garamond">Manage Home Page Content</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit Home Page Content</h2>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Loader /></div>
                ) : isError ? (
                    // Error State
                    <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-2xl mx-auto">
                         <h3 className="font-semibold text-lg mb-2">Error Loading Content</h3>
                         <p>{error?.message || "Could not load current home page content."}</p>
                    </div>
                ) : (
                    // Form Display State
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">

                            {/* Hero Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Hero Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="heroImageURL" render={({ field }) => ( <FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} type="url" placeholder="https://..." className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroImageAlt" render={({ field }) => ( <FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} placeholder="Describe the hero image" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroHeadingLine1" render={({ field }) => ( <FormItem><FormLabel>Heading Line 1</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroHeadingLine2" render={({ field }) => ( <FormItem><FormLabel>Heading Line 2 (Emphasis)</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroParagraph" render={({ field }) => ( <FormItem><FormLabel>Paragraph Text</FormLabel><FormControl><Textarea {...field} rows={3} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroButtonText" render={({ field }) => ( <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} placeholder="e.g., Explore Journeys" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Introduction Section Fields */}
                             <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Introduction Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField control={form.control} name="introHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                     <FormField control={form.control} name="introParagraph1" render={({ field }) => ( <FormItem><FormLabel>Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                     <FormField control={form.control} name="introParagraph2" render={({ field }) => ( <FormItem><FormLabel>Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Featured Pilgrimages Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Featured Pilgrimages Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="featuredHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapURL" render={({ field }) => ( <FormItem><FormLabel>Map Image URL</FormLabel><FormControl><Input {...field} type="url" placeholder="https://..." className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapAlt" render={({ field }) => ( <FormItem><FormLabel>Map Image Alt Text</FormLabel><FormControl><Input {...field} placeholder="Describe the map image" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapCaption" render={({ field }) => ( <FormItem><FormLabel>Map Caption</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredButtonText" render={({ field }) => ( <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} placeholder="e.g., View All Pilgrimages" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                             {/* Image Carousel Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Image Carousel Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="carouselHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Moments from Our Journeys" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Why Choose Us Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">"Why Choose Us" Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="whyHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Why Journey With Us" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                        {/* Reason 1 */}
                                        <div className="border border-faded-gold/50 p-4 rounded space-y-3 bg-parchment/70">
                                            <FormField control={form.control} name="why1Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 1 (Symbol/Emoji)</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why1Title" render={({ field }) => ( <FormItem><FormLabel>Title 1</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why1Text" render={({ field }) => ( <FormItem><FormLabel>Text 1</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                        {/* Reason 2 */}
                                         <div className="border border-faded-gold/50 p-4 rounded space-y-3 bg-parchment/70">
                                            <FormField control={form.control} name="why2Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 2</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why2Title" render={({ field }) => ( <FormItem><FormLabel>Title 2</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why2Text" render={({ field }) => ( <FormItem><FormLabel>Text 2</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                        {/* Reason 3 */}
                                         <div className="border border-faded-gold/50 p-4 rounded space-y-3 bg-parchment/70">
                                            <FormField control={form.control} name="why3Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 3</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why3Title" render={({ field }) => ( <FormItem><FormLabel>Title 3</FormLabel><FormControl><Input {...field} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why3Text" render={({ field }) => ( <FormItem><FormLabel>Text 3</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                             {/* Testimonials Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Testimonials Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="testimonialsHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Pilgrim Chronicles" className="parchment-input border-faded-gold"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending || !form.formState.isDirty}
                                    size="lg"
                                    className="min-w-[150px]" // Ensure consistent button size
                                >
                                    {/* Use updateMutation.isPending */}
                                    {updateMutation.isPending ? (
                                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                                    ) : ( "Save Home Page Content" )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}