// client/src/pages/Admin/ManageHomePage.tsx
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
import { HomePageContent, InsertHomePageContent, upsertHomePageContentSchema } from "@shared/schema";

// Fetch function (can reuse the one from Home.tsx or define here)
async function fetchHomePageContentAdmin(): Promise<HomePageContent> {
    const res = await apiRequest("GET", "/api/content/home");
    if (!res.ok) throw new Error("Failed to fetch home page content for admin");
    return res.json();
}

// Define the form values based on the schema
type HomePageFormValues = InsertHomePageContent;

export default function ManageHomePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current content
    const { data: currentContent, isLoading, isError, error } = useQuery<HomePageContent, Error>({
        queryKey: ['homeContentAdmin'], // Separate key for admin maybe
        queryFn: fetchHomePageContentAdmin,
    });

    const form = useForm<HomePageFormValues>({
        resolver: zodResolver(upsertHomePageContentSchema),
        defaultValues: {}, // Will be populated by useEffect
    });

    // Populate form once data is loaded
    useEffect(() => {
        if (currentContent) {
            form.reset(currentContent);
        }
    }, [currentContent, form]);

    // Mutation for updating content
    const updateMutation = useMutation<HomePageContent, Error, HomePageFormValues>({
        mutationFn: (data) => apiRequest("PATCH", "/api/content/home", data).then(res => res.json()),
        onSuccess: (updatedData) => {
            toast({ title: "Content Updated", description: "Home page content saved." });
            queryClient.setQueryData(['homeContentAdmin'], updatedData); // Update admin cache
            queryClient.invalidateQueries({ queryKey: ['homeContent'] }); // Invalidate public cache
            form.reset(updatedData); // Reset form with new data
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message || "Could not save changes.", variant: "destructive" });
        },
    });

    const onSubmit = (data: HomePageFormValues) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-parchment">
            {/* Admin Header */}
            <div className="bg-monastic-red text-parchment p-4"> <div className="container mx-auto flex justify-between items-center"> <div className="flex items-center space-x-2"> <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span> <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors"> Sacred Bhutan Admin </Link> </div> <span className="font-garamond">Manage Home Page Content</span> </div> </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit Home Page Content</h2>

                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                ) : isError ? (
                    <div className="text-center text-destructive py-8">Error loading content: {error?.message}</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">

                            {/* Hero Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Hero Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="heroImageURL" render={({ field }) => ( <FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} placeholder="https://..." className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroImageAlt" render={({ field }) => ( <FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroHeadingLine1" render={({ field }) => ( <FormItem><FormLabel>Heading Line 1</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroHeadingLine2" render={({ field }) => ( <FormItem><FormLabel>Heading Line 2 (Gold)</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroParagraph" render={({ field }) => ( <FormItem><FormLabel>Paragraph</FormLabel><FormControl><Textarea {...field} rows={3} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="heroButtonText" render={({ field }) => ( <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Introduction Section Fields */}
                             <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Introduction Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField control={form.control} name="introHeading" render={({ field }) => ( <FormItem><FormLabel>Heading</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                     <FormField control={form.control} name="introParagraph1" render={({ field }) => ( <FormItem><FormLabel>Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                     <FormField control={form.control} name="introParagraph2" render={({ field }) => ( <FormItem><FormLabel>Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Featured Pilgrimages Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Featured Pilgrimages Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="featuredHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapURL" render={({ field }) => ( <FormItem><FormLabel>Map Image URL</FormLabel><FormControl><Input {...field} placeholder="https://..." className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapAlt" render={({ field }) => ( <FormItem><FormLabel>Map Image Alt Text</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredMapCaption" render={({ field }) => ( <FormItem><FormLabel>Map Caption</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="featuredButtonText" render={({ field }) => ( <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                             {/* Image Carousel Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Image Carousel Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="carouselHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Why Choose Us Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">"Why Choose Us" Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="whyHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                        {/* Reason 1 */}
                                        <div className="border border-faded-gold/50 p-3 rounded space-y-2">
                                            <FormField control={form.control} name="why1Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 1 (Symbol/Emoji)</FormLabel><FormControl><Input {...field} className="parchment-input w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why1Title" render={({ field }) => ( <FormItem><FormLabel>Title 1</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why1Text" render={({ field }) => ( <FormItem><FormLabel>Text 1</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                        {/* Reason 2 */}
                                         <div className="border border-faded-gold/50 p-3 rounded space-y-2">
                                            <FormField control={form.control} name="why2Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 2</FormLabel><FormControl><Input {...field} className="parchment-input w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why2Title" render={({ field }) => ( <FormItem><FormLabel>Title 2</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why2Text" render={({ field }) => ( <FormItem><FormLabel>Text 2</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                        {/* Reason 3 */}
                                         <div className="border border-faded-gold/50 p-3 rounded space-y-2">
                                            <FormField control={form.control} name="why3Icon" render={({ field }) => ( <FormItem><FormLabel>Icon 3</FormLabel><FormControl><Input {...field} className="parchment-input w-16 text-center"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why3Title" render={({ field }) => ( <FormItem><FormLabel>Title 3</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="why3Text" render={({ field }) => ( <FormItem><FormLabel>Text 3</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                             {/* Testimonials Section Fields */}
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Testimonials Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="testimonialsHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty} size="lg">
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