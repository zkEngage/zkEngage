// zkEngage/client/src/utils/api.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const api = {
  // Existing Auth Endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token); // Store token for future requests
      }
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API login error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async signup(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token); // Store token for future requests
      }
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API signup error:", error);
      return { success: false, message: "Network error" };
    }
  },

  // New Endpoints for zkEngage Features
  async getUserStats(): Promise<ApiResponse<{ totalXP: number; completedQuests: number; streak: number; rank: number }>> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API getUserStats error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async getUserQuests(): Promise<ApiResponse<{ id: number; title: string; isCompleted: boolean }[]>> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quests/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API getUserQuests error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async completeQuest(questId: number): Promise<ApiResponse<{ xpEarned: number }>> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API completeQuest error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async generateProof(proofData: string): Promise<ApiResponse<{ xpEarned: number }>> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/proofs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ proofData }),
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API generateProof error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async mintNFT(): Promise<ApiResponse<{ nftId: string }>> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/nfts/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API mintNFT error:", error);
      return { success: false, message: "Network error" };
    }
  },
};


//===================



import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const token = localStorage.getItem("authToken");

  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      if (!token) return null;

      const res = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });

      if (!res.ok) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        return null;
      }

      return res.json();
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}


==============

=============



// Home.tsx
import { Redirect } from "wouter"; // add this

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="text-white flex justify-center mt-20">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />; // ✅ block access if no token/user
  }

  // ... rest of your Home code
}
