import React, { useState } from "react";
import { api } from "@/utils/api"; // <-- Import your API helper

const EmailLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email and password are required!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call centralized API helper
      const result = await api.login(email, password);

      if (!result.success) {
        alert(result.message || "Login failed");
        return;
      }

      // ✅ Store token + user globally
      if (result.token) localStorage.setItem("token", result.token);
      if (result.user) localStorage.setItem("user", JSON.stringify(result.user));

      alert(`Welcome back, ${result.user?.username || result.user?.email}!`);
      window.location.href = "/dashboard"; // Redirect to dashboard
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-3 max-w-md mx-auto p-4 border rounded-lg shadow"
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className={`bg-purple-600 text-white p-2 rounded hover:bg-purple-700 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default EmailLoginForm;
