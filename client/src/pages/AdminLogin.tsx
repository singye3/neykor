// client/src/pages/AdminLogin.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bhutaneseSymbols } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAdminState } = useAdmin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => 
      apiRequest("POST", "/api/admin/login", data),
    onSuccess: () => {
      setAdminState({
        isLoggedIn: true,
        username: form.getValues().username,
      });
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard.",
      });
      setLocation("/admin/dashboard");
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen lokta-paper-bg flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md bg-parchment/90 border-faded-gold">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center text-monastic-red mb-4">
            <span className="text-5xl">{bhutaneseSymbols.dharmaWheel}</span>
          </div>
          <CardTitle className="font-trajan text-2xl text-monastic-red">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-garamond text-lg">Username</FormLabel>
                    <FormControl>
                      <Input {...field} className="parchment-input" disabled={loginMutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-garamond text-lg">Password</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        className="parchment-input" 
                        disabled={loginMutation.isPending} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                variant="default"
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
