// signup.tsx
import React, { useState } from "react";
import { useAuth } from "./auth";

export default function Signup() {
  const { signupEmail, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="p-6 max-w-md mx-auto bg-white/10 rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signupEmail(email, password);
        }}
        className="space-y-3"
      >
        <input
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 rounded-xl"
          disabled={loading}
        >
          {loading ? "Creating…" : "Sign Up"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
