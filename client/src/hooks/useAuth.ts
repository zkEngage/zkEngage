// hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
//import { useNavigate } from "wouter";
import { useLocation } from "wouter"; // ✅ correct

export function useAuth() {
  const [, navigate] = useLocation(); // ✅ navigate now comes from useLocation()
  const token = localStorage.getItem("authToken");

  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      if (!token) return null;

      const res = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        // ❌ token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login"); // 🔄 redirect to login
        return null;
      }

      if (!res.ok) return null;
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
