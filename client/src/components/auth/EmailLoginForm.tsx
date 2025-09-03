import React, { useState } from "react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email and password are required!");
      return;
    }

    // Backend API calls
    const loginData = { email, password };
    console.log("Login Data (to send to backend):", loginData);

    alert("Login form submitted! (waiting for backend)");
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-md mx-auto p-4 border rounded-lg shadow">
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" />
      <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Login</button>
    </form>
  );
};

export default LoginForm;
