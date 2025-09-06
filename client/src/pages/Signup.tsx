import React, { useState } from "react";
import { api } from "@/utils/api"; // <-- Import API helper

const EmailSignupForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call centralized API helper
      const result = await api.signup(email, password);

      if (!result.success) {
        alert(result.message || "Signup failed");
        return;
      }

      // ✅ Store JWT token & user
      if (result.token) localStorage.setItem("token", result.token);
      if (result.user) localStorage.setItem("user", JSON.stringify(result.user));

      alert(`Welcome to zkEngage, ${result.user?.username || result.user?.email}! 🎉`);
      window.location.href = "/dashboard"; // Redirect to dashboard
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
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
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className={`bg-green-600 text-white p-2 rounded hover:bg-green-700 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default EmailSignupForm;
