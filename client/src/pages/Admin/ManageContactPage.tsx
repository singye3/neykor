// client/src/pages/Admin/ManageContactPage.tsx

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
import { ContactPageSettings, InsertContactPageSettings, upsertContactPageSettingsSchema } from "@shared/schema";

// Removed separate fetchAdminContactSettings function

// Form values type based on the upsert schema
type ContactPageFormValues = InsertContactPageSettings;

export default function ManageContactPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current settings using useQuery and apiRequest directly
    const { data: currentSettings, isLoading, isError, error } = useQuery<ContactPageSettings, Error>({
        queryKey: ['adminContactPageSettings'], // Unique key for admin data
        // --- UPDATED queryFn ---
        queryFn: () => apiRequest<ContactPageSettings>("GET", "/api/content/contact"),
        // --- End Update ---
        staleTime: 1000 * 60, // Keep admin data fresh for 1 minute
        refetchOnWindowFocus: true,
    });

    // Initialize React Hook Form
    const form = useForm<ContactPageFormValues>({
        resolver: zodResolver(upsertContactPageSettingsSchema),
        defaultValues: { // Initialize with defaults (will be overridden by useEffect)
            pageHeading: "", locationHeading: "", address: "",
            email: "", phone: "", officeHoursHeading: "", officeHoursText: "",
        },
    });

    // Populate form once data is loaded
    useEffect(() => {
        if (currentSettings) {
            form.reset(currentSettings); // Reset form with fetched data
        }
    }, [currentSettings, form]); // Dependencies

    // Mutation for updating settings
    const updateMutation = useMutation<ContactPageSettings, Error, ContactPageFormValues>({
        // --- UPDATED mutationFn ---
        mutationFn: async (data: ContactPageFormValues) => {
             // Use apiRequest directly, which returns parsed JSON or throws
            return apiRequest<ContactPageSettings>("PATCH", "/api/content/contact", data);
        },
        // --- End Update ---
        onSuccess: (updatedData) => {
            toast({ title: "Settings Updated", description: "Contact page content has been saved successfully." });
            queryClient.setQueryData(['adminContactPageSettings'], updatedData); // Update admin cache instantly
            queryClient.invalidateQueries({ queryKey: ['contactPageSettings'] }); // Invalidate public cache
            form.reset(updatedData); // Reset form with new data to clear dirty state
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message || "Could not save changes.", variant: "destructive" });
        },
    });

    // Form submission handler
    const onSubmit = (data: ContactPageFormValues) => {
        updateMutation.mutate(data); // Trigger the update mutation
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
                    <span className="font-garamond">Manage Contact Page</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6">
                <h2 className="font-trajan text-2xl text-monastic-red mb-6">Edit Contact Page Content</h2>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Loader /></div>
                 ) : isError ? (
                     // Error State
                    <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-2xl mx-auto">
                        <h3 className="font-semibold text-lg mb-2">Error Loading Settings</h3>
                        <p>{error?.message || "Could not load current contact page settings."}</p>
                    </div>
                ) : (
                    // Form Display State
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">

                             {/* Page Header Card */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Page Header</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField control={form.control} name="pageHeading" render={({ field }) => ( <FormItem><FormLabel>Main Page Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Connect With Us" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Location Section Card */}
                            <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Location & Contact Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="locationHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Our Office in Thimphu" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="Street, City, Country" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Contact Email Address</FormLabel><FormControl><Input type="email" {...field} placeholder="info@example.com" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Contact Phone Number</FormLabel><FormControl><Input {...field} placeholder="+975 ..." className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Office Hours Section Card */}
                             <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-monastic-red font-semibold">Office Hours Section</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField control={form.control} name="officeHoursHeading" render={({ field }) => ( <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input {...field} placeholder="e.g., Office Hours" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                     {/* Changed officeHoursText to Textarea for potentially longer text */}
                                     <FormField control={form.control} name="officeHoursText" render={({ field }) => ( <FormItem><FormLabel>Hours Information</FormLabel><FormControl><Textarea {...field} rows={2} placeholder="e.g., Mon-Fri: 9 AM - 5 PM (BST)" className="parchment-input"/></FormControl><FormMessage /></FormItem> )}/>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending || !form.formState.isDirty} // Disable if pending or form unchanged
                                    size="lg"
                                    className="min-w-[150px]" // Ensure consistent button size
                                >
                                    {updateMutation.isPending ? (
                                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                                    ) : ( "Save Contact Page" )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}