// client/src/pages/auth-page.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { bhutaneseSymbols } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/admin/dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen lokta-paper-bg">
        <Loader2 className="h-8 w-8 animate-spin text-monastic-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lokta-paper-bg flex items-center">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form Section */}
          <div className="flex flex-col justify-center">
            <Card className="w-full bg-parchment/90 border-faded-gold shadow-lg">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center text-monastic-red mb-2">
                  <span className="text-4xl">{bhutaneseSymbols.dharmaWheel}</span>
                </div>
                <CardTitle className="font-trajan text-2xl text-monastic-red">Admin Portal</CardTitle>
                <CardDescription className="text-charcoal/80">
                  Login or create an account to manage website content
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-garamond text-lg">Username</FormLabel>
                              <FormControl>
                                <Input {...field} className="border-faded-gold" disabled={loginMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-garamond text-lg">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  className="border-faded-gold" 
                                  disabled={loginMutation.isPending} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-monastic-red hover:bg-monastic-red/80" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-garamond text-lg">Username</FormLabel>
                              <FormControl>
                                <Input {...field} className="border-faded-gold" disabled={registerMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-garamond text-lg">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  className="border-faded-gold" 
                                  disabled={registerMutation.isPending} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-monastic-red hover:bg-monastic-red/80" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col justify-center bg-monastic-red rounded-lg shadow-lg p-8 text-parchment">
            <div className="flex justify-center mb-6">
              <span className="text-5xl">{bhutaneseSymbols.endlessKnot}</span>
            </div>
            <h2 className="font-trajan text-2xl text-center mb-4">Sacred Bhutan Travels</h2>
            <div className="space-y-4 font-garamond">
              <p>
                Welcome to the administrative portal for Sacred Bhutan Travels. This secure gateway allows authorized personnel to manage the website's content and respond to customer inquiries.
              </p>
              <div className="border-t border-faded-gold my-6 pt-6">
                <h3 className="font-trajan text-xl mb-3">Administrator Functions</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Manage pilgrimage tour details and itineraries</li>
                  <li>Monitor and respond to customer inquiries</li>
                  <li>Update image gallery and testimonials</li>
                  <li>Track website statistics and engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}