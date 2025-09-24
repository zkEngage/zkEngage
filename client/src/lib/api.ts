import axios from "axios";

// Create a preconfigured Axios instance
export const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ensures cookies/sessions are sent if you need them
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Helper functions (optional) ----

// POST wallet auth
export const walletAuth = async (walletAddress: string) => {
  const res = await api.post("/auth/wallet-auth", { walletAddress });
  return res.data;
};

// Example: check user status
export const getUserStatus = async () => {
  const res = await api.get("/auth/status");
  return res.data;
};

// Example: logout
export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
