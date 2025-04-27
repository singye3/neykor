// client/src/pages/Admin/ManageSiteSettings.tsx
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { bhutaneseSymbols } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { SiteSettings, upsertSiteSettingsSchema, changePasswordSchema, changeUsernameSchema } from "@shared/schema"; // Import all needed schemas
import type { ChangePasswordInput, ChangeUsernameInput } from "@shared/schema"; // Import types
import { useAuth } from "@/hooks/use-auth"; // Import useAuth to get current user info

// Zod schema for client-side password form validation (with confirmation)
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"], // Error applies to the confirmPassword field
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Client-side username form validation schema
const usernameFormSchema = z.object({
    newUsername: z.string().min(3, "New username must be at least 3 characters"),
    currentPassword: z.string().min(1, "Current password is required"),
});
type UsernameFormValues = z.infer<typeof usernameFormSchema>;

// Site Settings Form values type
type SiteSettingsFormValues = z.infer<typeof upsertSiteSettingsSchema>;

export default function ManageSiteSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth(); // Get current user info (for username pre-fill)

    // --- Site Settings Form Logic ---
    const { data: currentSettings, isLoading: isLoadingSettings, isError: isSettingsError, error: settingsError } = useQuery<SiteSettings, Error>({
        queryKey: ['adminSiteSettings'],
        queryFn: () => apiRequest<SiteSettings>("GET", "/api/admin/settings/site"),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
    });

    const settingsForm = useForm<SiteSettingsFormValues>({
        resolver: zodResolver(upsertSiteSettingsSchema),
        defaultValues: { siteName: "" },
    });

    useEffect(() => {
        if (currentSettings) {
            settingsForm.reset({ siteName: currentSettings.siteName }); // Only reset siteName
        }
    }, [currentSettings, settingsForm]);

    const updateSettingsMutation = useMutation<SiteSettings, Error, SiteSettingsFormValues>({
        mutationFn: (data: SiteSettingsFormValues) => apiRequest<SiteSettings>("PATCH", "/api/admin/settings/site", data),
        onSuccess: (updatedData) => {
            toast({ title: "Settings Updated", description: "Site name saved successfully." });
            queryClient.setQueryData(['adminSiteSettings'], updatedData);
            queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
            settingsForm.reset(updatedData);
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message || "Could not save site name.", variant: "destructive" });
        },
    });

    const onSettingsSubmit: SubmitHandler<SiteSettingsFormValues> = (data) => {
        updateSettingsMutation.mutate(data);
    };
    // --------------------------------------------

    // --- Password Change Form Logic ---
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const updatePasswordMutation = useMutation<{}, Error, ChangePasswordInput>({ // Use specific input type
        mutationFn: (data) => apiRequest("PATCH", "/api/admin/user/password", data),
        onSuccess: () => {
            toast({ title: "Password Updated", description: "Admin password changed successfully." });
            passwordForm.reset();
        },
        onError: (err: any) => {
            toast({ title: "Password Update Failed", description: err.message || "An unknown error occurred.", variant: "destructive" });
        },
    });

    const onPasswordSubmit: SubmitHandler<PasswordFormValues> = (data) => {
        const { confirmPassword, ...payload } = data; // Exclude confirmPassword from payload
        updatePasswordMutation.mutate(payload);
    };
    // ----------------------------------------

    // --- Username Change Form Logic ---
    const usernameForm = useForm<UsernameFormValues>({
        resolver: zodResolver(usernameFormSchema),
        defaultValues: { newUsername: user?.username || "", currentPassword: "" },
    });

    useEffect(() => { // Update default username if user context changes
        if (user && usernameForm.getValues("newUsername") !== user.username) {
            usernameForm.reset({ newUsername: user.username, currentPassword: "" });
        }
    }, [user, usernameForm]);

    const updateUsernameMutation = useMutation<{}, Error, ChangeUsernameInput>({ // Use specific input type
        mutationFn: (data) => apiRequest("PATCH", "/api/admin/user/username", data),
        onSuccess: (_, variables) => { // Access submitted variables if needed
            toast({ title: "Username Updated", description: "Admin username changed successfully." });
            usernameForm.reset({
                newUsername: variables.newUsername, // Keep the new username in the field
                currentPassword: ""
            });
            queryClient.invalidateQueries({ queryKey: ['user'] }); // Refetch user data for potential display elsewhere
        },
        onError: (err: any) => {
            toast({ title: "Username Update Failed", description: err.message || "An unknown error occurred.", variant: "destructive" });
        },
    });

    const onUsernameSubmit: SubmitHandler<UsernameFormValues> = (data) => {
        if (data.newUsername === user?.username) {
             toast({ title: "No Change", description: "New username is the same as the current one."});
             return;
        }
        updateUsernameMutation.mutate(data);
    };
    // --------------------------------------

    // Render Logic
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
                    <span className="font-garamond">Manage Site & Admin Account</span>
                 </div>
             </div>

            {/* Content Area */}
            <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Column 1: Site Name & Username */}
                <div className="space-y-8">
                    {/* --- Site Settings Card --- */}
                    <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-monastic-red">Site Name</CardTitle>
                            <CardDescription>Set the public name displayed across the site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isLoadingSettings ? <div className="flex justify-center p-4"><Loader /></div> : isSettingsError ? <p className="text-destructive">Error loading settings: {settingsError?.message}</p> : (
                               <Form {...settingsForm}>
                                   <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                                       <FormField control={settingsForm.control} name="siteName" render={({ field }) => (
                                           <FormItem>
                                               <FormLabel>Website Name</FormLabel>
                                               <FormControl><Input {...field} placeholder="Your Website Name" className="parchment-input border-faded-gold" /></FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )} />
                                       <div className="flex justify-end">
                                           <Button type="submit" disabled={updateSettingsMutation.isPending || !settingsForm.formState.isDirty} className="min-w-[140px]">
                                               {updateSettingsMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Site Name"}
                                           </Button>
                                       </div>
                                   </form>
                               </Form>
                           )}
                        </CardContent>
                    </Card>

                    {/* --- Change Username Card --- */}
                    <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-monastic-red">Change Admin Username</CardTitle>
                            <CardDescription>Update the username used for admin login.</CardDescription>
                        </CardHeader>
                        <Form {...usernameForm}>
                            <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-0">
                                <CardContent className="space-y-4">
                                    <FormField control={usernameForm.control} name="newUsername" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Username</FormLabel>
                                                <FormControl><Input {...field} placeholder="Enter new username (min. 3 characters)" className="parchment-input border-faded-gold" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField control={usernameForm.control} name="currentPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password <span className="text-xs text-gray-500">(Required)</span></FormLabel>
                                                <FormControl><Input type="password" {...field} placeholder="Enter current password to confirm" className="parchment-input border-faded-gold" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                </CardContent>
                                <CardFooter className="flex justify-end border-t border-faded-gold pt-4 mt-4">
                                    <Button type="submit" disabled={updateUsernameMutation.isPending || !usernameForm.formState.isDirty} className="min-w-[160px]">
                                        {updateUsernameMutation.isPending ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> ) : "Update Username"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                 </div>

                 {/* Column 2: Password */}
                 <div className="space-y-8">
                    {/* --- Change Password Card --- */}
                    <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-monastic-red">Change Admin Password</CardTitle>
                            <CardDescription>Update the password for the admin account.</CardDescription>
                        </CardHeader>
                         <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-0">
                               <CardContent className="space-y-4">
                                   <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl><Input type="password" {...field} placeholder="Enter your current password" className="parchment-input border-faded-gold" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                   <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} placeholder="Enter new password (min. 6 characters)" className="parchment-input border-faded-gold" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                   <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} placeholder="Re-enter new password" className="parchment-input border-faded-gold" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                                <CardFooter className="flex justify-end border-t border-faded-gold pt-4 mt-4">
                                    <Button type="submit" disabled={updatePasswordMutation.isPending || !passwordForm.formState.isDirty} className="min-w-[160px]">
                                        {updatePasswordMutation.isPending ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> ) : "Update Password"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </div>

            </div>
        </div>
    );
}