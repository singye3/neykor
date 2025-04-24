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

// Import the schema and types
import { AboutPageContent, InsertAboutPageContent, upsertAboutPageContentSchema } from "@shared/schema";

// Fetch function for admin page
async function fetchAboutContentAdmin(): Promise<AboutPageContent> {
    const res = await apiRequest("GET", "/api/content/about"); // Use apiRequest for auth cookies
    if (!res.ok) { // apiRequest throws on !res.ok, but check just in case
        throw new Error(`Failed to fetch about content: ${res.statusText}`);
    }
    return res.json();
}

export default function ManageAboutContent() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current content
    const { data: currentContent, isLoading: isLoadingContent, isError, error } = useQuery<AboutPageContent, Error>({
        queryKey: ['aboutContentAdmin'], // Query key specific to admin fetch
        queryFn: fetchAboutContentAdmin,
        staleTime: Infinity, // Keep admin data fresh, fetch on mount
    });

    const form = useForm<InsertAboutPageContent>({
        resolver: zodResolver(upsertAboutPageContentSchema),
        // Initialize with empty strings or defaults matching the Zod schema
        defaultValues: {
            mainHeading: "", imageUrl: "", imageAlt: "", historyText: "",
            missionText: "", philosophyHeading: "", philosophyQuote: "",
            value1Title: "", value1Text: "", value2Title: "", value2Text: "",
            value3Title: "", value3Text: "",
        },
    });

    // Populate form once data is loaded
    useEffect(() => {
        if (currentContent) {
            // Use form.reset to update all default values and mark form as clean
            form.reset(currentContent);
        }
    }, [currentContent, form]);

    // Mutation for updating content
    const updateMutation = useMutation<AboutPageContent, Error, InsertAboutPageContent>({
        mutationFn: (data: InsertAboutPageContent) =>
            apiRequest("PATCH", "/api/content/about", data).then(res => res.json()), // Use apiRequest and parse JSON
        onSuccess: (updatedData) => {
            toast({
                title: "Content Updated",
                description: "The About Us page content has been saved.",
            });
            // Update the query cache for this admin page with the new data
            queryClient.setQueryData(['aboutContentAdmin'], updatedData);
            // Invalidate the public query key to trigger a refetch on the public page
            queryClient.invalidateQueries({ queryKey: ['aboutContent'] });
            // Reset form to show the newly saved values and mark as pristine
            form.reset(updatedData);
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

    const onSubmit = (data: InsertAboutPageContent) => {
        // console.log("Submitting data:", data); // Debugging
        updateMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-parchment">
            {/* Admin Header */}
            <div className="bg-monastic-red text-parchment p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
                        <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors">
                            Sacred Bhutan Admin
                        </Link>
                    </div>
                    <span className="font-garamond">Manage About Us Content</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit About Us Page</h2>

                {isLoadingContent ? (
                    <div className="flex justify-center py-8"> <Loader /> </div>
                ) : isError ? (
                     <div className="text-center text-red-600 py-8">
                        Error loading content: {error?.message || "Unknown error"}
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Main Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="mainHeading" render={({ field }) => ( <FormItem><FormLabel>Main Heading</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} placeholder="https://..." className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="imageAlt" render={({ field }) => ( <FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="historyText" render={({ field }) => ( <FormItem><FormLabel>History Paragraph</FormLabel><FormControl><Textarea {...field} rows={5} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="missionText" render={({ field }) => ( <FormItem><FormLabel>Mission Paragraph</FormLabel><FormControl><Textarea {...field} rows={5} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                </CardContent>
                            </Card>

                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Philosophy Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="philosophyHeading" render={({ field }) => ( <FormItem><FormLabel>Philosophy Heading</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="philosophyQuote" render={({ field }) => ( <FormItem><FormLabel>Philosophy Quote</FormLabel><FormControl><Textarea {...field} rows={3} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                </CardContent>
                            </Card>

                            <Card className="border-faded-gold bg-parchment/50">
                                <CardHeader><CardTitle className="text-lg text-monastic-red">Values Section</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Value 1 */}
                                    <div className="space-y-2 border border-faded-gold/50 p-3 rounded">
                                        <FormField control={form.control} name="value1Title" render={({ field }) => ( <FormItem><FormLabel>Value 1 Title</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value1Text" render={({ field }) => ( <FormItem><FormLabel>Value 1 Text</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    {/* Value 2 */}
                                     <div className="space-y-2 border border-faded-gold/50 p-3 rounded">
                                        <FormField control={form.control} name="value2Title" render={({ field }) => ( <FormItem><FormLabel>Value 2 Title</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value2Text" render={({ field }) => ( <FormItem><FormLabel>Value 2 Text</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    {/* Value 3 */}
                                     <div className="space-y-2 border border-faded-gold/50 p-3 rounded">
                                        <FormField control={form.control} name="value3Title" render={({ field }) => ( <FormItem><FormLabel>Value 3 Title</FormLabel><FormControl><Input {...field} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="value3Text" render={({ field }) => ( <FormItem><FormLabel>Value 3 Text</FormLabel><FormControl><Textarea {...field} rows={4} className="parchment-input" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end mt-6">
                                <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
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