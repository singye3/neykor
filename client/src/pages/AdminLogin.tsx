// // client/src/pages/AdminLogin.tsx
// import { useState } from "react";
// import { useLocation } from "wouter";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import { z } from "zod";
// import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
// import { useToast } from "@/hooks/use-toast";
// import { useAdmin } from "@/contexts/AdminContext"; // Assuming this context exists for admin state

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { bhutaneseSymbols } from "@/lib/utils";
// import { Loader2 } from "lucide-react"; // Import Loader

// // Schema for login form validation
// const loginSchema = z.object({
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
// });

// // Type for login form values derived from schema
// type LoginFormValues = z.infer<typeof loginSchema>;

// // Interface representing the expected user object from the login API
// // Adjust properties based on what your /api/admin/login actually returns on success
// interface AdminUser {
//     id: number;
//     username: string;
//     // Add other relevant admin user properties if needed (e.g., role)
//     // IMPORTANT: Ensure the backend does NOT send the password hash
// }

// export default function AdminLogin() {
//   const [_, setLocation] = useLocation();
//   const { toast } = useToast();
//   const { setAdminState } = useAdmin(); // Function to update global admin state

//   // Initialize React Hook Form
//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       username: "",
//       password: "",
//     },
//   });

//   // Setup login mutation using React Query
//   const loginMutation = useMutation<AdminUser, Error, LoginFormValues>({ // Specify expected types
//     // --- UPDATED mutationFn ---
//     // Use async/await and specify expected return type from apiRequest
//     mutationFn: async (data: LoginFormValues) => {
//         // apiRequest now handles fetch, error checking, and JSON parsing
//         return apiRequest<AdminUser>("POST", "/api/admin/login", data);
//     },
//     // --- End Update ---
//     onSuccess: (loggedInUser) => { // onSuccess receives the parsed AdminUser data
//       setAdminState({
//         isLoggedIn: true,
//         // Use username from the successful API response for consistency
//         username: loggedInUser.username,
//       });
//       toast({
//         title: "Login Successful",
//         description: `Welcome back, ${loggedInUser.username}.`,
//       });
//       setLocation("/admin/dashboard"); // Redirect on successful login
//     },
//     onError: (error) => { // onError receives the Error object
//       toast({
//         title: "Login Failed",
//         // Display the actual error message from the API if available
//         description: error.message || "Invalid username or password.",
//         variant: "destructive",
//       });
//       // Clear password field on error for security/usability
//       form.resetField("password");
//     },
//   });

//   // Form submission handler
//   const onSubmit = (data: LoginFormValues) => {
//     loginMutation.mutate(data); // Trigger the mutation
//   };

//   return (
//     <div className="min-h-screen lokta-paper-bg flex items-center justify-center py-12 px-4">
//       <Card className="w-full max-w-md bg-parchment/90 border-faded-gold shadow-lg rounded-md">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center text-monastic-red mb-4">
//             <span className="text-5xl">{bhutaneseSymbols.dharmaWheel}</span>
//           </div>
//           <CardTitle className="font-trajan text-2xl text-monastic-red">Admin Portal Access</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               {/* Username Field */}
//               <FormField
//                 control={form.control}
//                 name="username"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-garamond text-lg">Username</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="Enter admin username"
//                         className="parchment-input border-faded-gold" // Added border class
//                         disabled={loginMutation.isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {/* Password Field */}
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-garamond text-lg">Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type="password"
//                         placeholder="Enter password"
//                         className="parchment-input border-faded-gold" // Added border class
//                         disabled={loginMutation.isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 variant="default" // Assuming default maps to your primary style
//                 className="w-full bg-monastic-red hover:bg-monastic-red/90 text-parchment" // Added styles
//                 disabled={loginMutation.isPending}
//               >
//                 {/* Show loader and text based on mutation pending state */}
//                 {loginMutation.isPending ? (
//                     <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Authenticating...
//                     </>
//                  ) : (
//                     "Login"
//                  )}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }