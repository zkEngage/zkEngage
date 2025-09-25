// hooks/useLogout.ts
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useDisconnect } from "wagmi";

export function useLogout() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { disconnect } = useDisconnect();

  function logout() {
    // 🛑 Disconnect wallet
    disconnect();

    // 🧹 Clear localStorage/session
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // 🧹 Clear cached user queries
    queryClient.removeQueries({ queryKey: ["authUser"] });

    // 🔄 Redirect to login
    navigate("/login");
  }

  return logout;
}
