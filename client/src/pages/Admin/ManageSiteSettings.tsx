// client/src/pages/Admin/ManageSiteSettings.tsx
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { SiteSettings, InsertSiteSettings, upsertSiteSettingsSchema } from "@shared/schema";

// Fetch function for admin settings
async function fetchAdminSiteSettings(): Promise<SiteSettings> {
    const res = await apiRequest("GET", "/api/admin/settings/site"); // Use admin endpoint
    if (!res.ok) throw new Error("Failed to fetch site settings for admin");
    return res.json();
}

// Form values type
type SiteSettingsFormValues = InsertSiteSettings;

export default function ManageSiteSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current settings
    const { data: currentSettings, isLoading, isError, error } = useQuery<SiteSettings, Error>({
        queryKey: ['adminSiteSettings'], // Use a distinct key
        queryFn: fetchAdminSiteSettings,
    });

    const form = useForm<SiteSettingsFormValues>({
        resolver: zodResolver(upsertSiteSettingsSchema),
        defaultValues: {
            siteName: "",
            // Initialize other fields if added later
        },
    });

    // Populate form once data is loaded
    useEffect(() => {
        if (currentSettings) {
            form.reset(currentSettings);
        }
    }, [currentSettings, form]);

    // Mutation for updating settings
    const updateMutation = useMutation<SiteSettings, Error, SiteSettingsFormValues>({
        mutationFn: (data) => apiRequest("PATCH", "/api/admin/settings/site", data).then(res => res.json()),
        onSuccess: (updatedData) => {
            toast({ title: "Settings Updated", description: "Site settings saved successfully." });
            queryClient.setQueryData(['adminSiteSettings'], updatedData); // Update admin cache
            queryClient.invalidateQueries({ queryKey: ['siteSettings'] }); // Invalidate public cache
            form.reset(updatedData); // Reset form with new data
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message || "Could not save settings.", variant: "destructive" });
        },
    });

    const onSubmit = (data: SiteSettingsFormValues) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-parchment">
            {/* Admin Header */}
             <div className="bg-monastic-red text-parchment p-4"> <div className="container mx-auto flex justify-between items-center"> <div className="flex items-center space-x-2"> <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span> <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors"> Sacred Bhutan Admin </Link> </div> <span className="font-garamond">Manage Site Settings</span> </div> </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Site Settings</h2>

                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                ) : isError ? (
                    <div className="text-center text-destructive py-8">Error loading settings: {error?.message}</div>
                ) : (
                    <Card className="border-faded-gold bg-parchment/50 max-w-2xl mx-auto">
                         <CardHeader>
                            <CardTitle className="text-lg text-monastic-red">General Settings</CardTitle>
                         </CardHeader>
                         <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="siteName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="parchment-input" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Add fields for other settings here */}

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                                            {updateMutation.isPending ? (
                                                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                                            ) : ( "Save Settings" )}
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