// zkEngage/client/src/utils/api.ts
export const api = {
  async login(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API login error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async signup(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("API signup error:", error);
      return { success: false, message: "Network error" };
    }
  },
};
