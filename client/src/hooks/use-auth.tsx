// client/src/hooks/use-auth.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  QueryObserverResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter"; // <-- Import useLocation

type AuthContextType = {
  user: SelectUser | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  authMethod: 'pending' | 'session' | 'login' | 'none';
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  refetchUser: () => Promise<QueryObserverResult<SelectUser | null, Error>>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<'pending' | 'session' | 'login' | 'none'>('pending');
  const [, navigate] = useLocation(); // <-- Get the navigation function from useLocation

  const {
    data: user,
    error,
    isLoading: isUserQueryLoading,
    isFetched,
    refetch: refetchUser
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (isFetched && !isUserQueryLoading) {
        if (user && authMethod === 'pending') {
            setAuthMethod('session');
        } else if (!user && authMethod === 'pending') {
            setAuthMethod('none');
        }
    }
  }, [user, isFetched, isUserQueryLoading, authMethod]);

  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      return await apiRequest<SelectUser>("POST", "/api/login", credentials);
    },
    onSuccess: (loggedInUser: SelectUser) => {
      queryClient.setQueryData(["/api/user"], loggedInUser);
      setAuthMethod('login');
      toast({
        title: "Login successful",
        description: "Welcome back.",
      });
    },
    onError: (error: Error) => {
      setAuthMethod('none');
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<SelectUser, Error, InsertUser>({
    mutationFn: async (credentials: InsertUser) => {
      return await apiRequest<SelectUser>("POST", "/api/register", credentials);
    },
    onSuccess: (newUser: SelectUser) => {
      queryClient.setQueryData(["/api/user"], newUser);
      setAuthMethod('login');
      toast({
        title: "Registration successful",
        description: "Your account has been created and you are logged in.",
      });
    },
    onError: (error: Error) => {
      setAuthMethod('none');
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSettled: () => {
      queryClient.setQueryData(["/api/user"], null);
      setAuthMethod('none');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
       navigate('/'); // <-- Use the navigate function from useLocation
    },
    onError: (error: Error) => {
      console.error("Logout API call failed:", error);
      toast({
        title: "Logout Issue",
        description: error.message || "Logout request failed, but you have been logged out locally.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isUserQueryLoading && authMethod === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        error,
        authMethod,
        loginMutation,
        logoutMutation,
        registerMutation,
        refetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}