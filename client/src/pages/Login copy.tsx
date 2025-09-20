import { useState } from 'react';
//import { useNavigate } from "wouter"; // For redirecting
import { useLocation } from "wouter"; // ✅ correct hook
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect } from 'wagmi';
import { injected } from '@wagmi/connectors';
import { useAuth } from "@/hooks/useAuth";
import { useDisconnect } from 'wagmi';


const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { isAuthenticated } = useAuth();
  //const navigate = useNavigate(); // redirect
  const [, navigate] = useLocation(); // ✅ navigate is actually setLocation
  const { disconnect } = useDisconnect();


  if (isAuthenticated) {
    navigate("/home"); // ✅ redirect if already logged in
    return null; // stop rendering login page
  }

const handleWalletConnect = async () => {
  setLoading(true);
  try {
    // 1️⃣ Connect wallet
    connect({ connector: injected({ target: 'metaMask' }) });

    // 2️⃣ Wait until wallet is connected
    // Note: `useAccount()` updates `isConnected` and `address` automatically
    //if (!isConnected || !address) {
      //console.log("Waiting for wallet connection...");
      // Wait for 1–2 seconds or until address is populated
      //await new Promise(resolve => setTimeout(resolve, 1500));
    //}

    if (!address) {
      throw new Error("Wallet address not found after connecting");
    }

    console.log('Wallet connected:', address);

    // 3️⃣ Call backend to login/signup wallet
    const res = await fetch("/api/auth/wallet-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend error:", text);
      alert("Wallet authentication failed");
      return;
    }

    const data = await res.json();

    if (data?.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home"); // ✅ redirect after successful login
    } else {
      alert("Wallet authentication failed: no token received");
    }

  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert(`Wallet connection failed: ${(err as Error).message}`);
  } finally {
    setLoading(false);
  }
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate proof generation (to be replaced with zkVerify integration)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">Welcome Back</h1>
          <p className="text-gray-300 animate-fade-in-up">Sign in with your wallet</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            placeholder="Wallet Address"
            value={isConnected ? address || '' : ''}
            readOnly={isConnected}
            className="bg-white/20 border-white/30 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:border-indigo-400 transition-all duration-300 animate-fade-in-up"
          />
          <Button
            type="button"
            onClick={handleWalletConnect}
            disabled={loading || isConnected}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Connecting...
              </div>
            ) : isConnected ? (
              'Wallet Connected'
            ) : (
              'Connect Wallet (MetaMask/Talisman)'
            )}
          </Button>
          {isConnected && (
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying Proof...
                </div>
              ) : (
                'Sign In with zkProof'
              )}
            </Button>
          )}

           {/* ✅ Disconnect Wallet Button (only if connected) */}
              {isConnected && (
                <Button
                  type="button"
                  onClick={() => {
                    disconnect(); // wagmi disconnect
                    localStorage.removeItem("authToken"); // clear your token
                    localStorage.removeItem("user");      // clear user data
                    navigate("/login");                   // redirect to login
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Disconnect Wallet
                </Button>
              )}
        </form>
        <p className="text-center text-gray-400 mt-6 animate-fade-in-up">
          New here? <a href="/signup" className="text-indigo-300 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;