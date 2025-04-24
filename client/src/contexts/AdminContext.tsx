import React, { createContext, useContext, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminState {
  isLoggedIn: boolean;
  username: string | null;
}

interface AdminContextType {
  adminState: AdminState;
  setAdminState: React.Dispatch<React.SetStateAction<AdminState>>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminState, setAdminState] = useState<AdminState>({
    isLoggedIn: false,
    username: null,
  });
  const { toast } = useToast();

  const logout = async () => {
    try {
      // In a real app with JWT or sessions, you would make a request to invalidate
      // await apiRequest("POST", "/api/admin/logout", {});
      
      setAdminState({ isLoggedIn: false, username: null });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminContext.Provider value={{ adminState, setAdminState, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
