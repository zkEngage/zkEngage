import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { useAuth } from "@/hooks/useAuth";
import { FaWallet } from 'react-icons/fa'; // Generic icons (customize with wallet-specific icons)

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isConnected || !address || loading) return;

    const loginWithWallet = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/wallet-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend error:", text);
          alert("Wallet authentication failed");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/home");
        } else {
          alert("Wallet authentication failed: no token received");
        }
      } catch (err) {
        console.error("Wallet auth failed:", err);
        alert("Wallet connection failed");
      } finally {
        setLoading(false);
      }
    };

    loginWithWallet();
  }, [isConnected, address, navigate]);

  const handleButtonAction = async () => {
    if (loading) return;

    if (!isConnected) {
      setLoading(true);
      try {
        let connector;
        if (selectedWallet === 'walletconnect') {
          connector = walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID });
        } else if (selectedWallet === 'coinbaseWallet') {
          connector = coinbaseWallet({ appName: 'zkEngage' });
        } else {
          connector = injected({ target: 'metaMask' });
        }
        await connect({ connector });
      } catch (err) {
        console.error("Connection failed:", err);
        alert("Failed to connect wallet. Ensure the extension is installed and unlocked.");
        setLoading(false);
      }
    } else {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock zkProof
      setLoading(false);
      alert("zkProof verification simulated - proceed to home (mock)");
      navigate("/home");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const walletOptions = [
    { value: 'injected', label: 'MetaMask', icon: <FaWallet className="text-orange-500" /> },
    { value: 'walletconnect', label: 'Rainbow Wallet', icon: <FaWallet className="text-indigo-500" /> },
    { value: 'coinbaseWallet', label: 'Coinbase Wallet', icon: <FaWallet className="text-blue-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">Welcome Back</h1>
          <p className="text-gray-300 animate-fade-in-up">Sign in with your wallet</p>
        </div>
        <form className="space-y-6">
          <Input
            type="text"
            placeholder="Wallet Address"
            value={isConnected ? address || '' : ''}
            readOnly={isConnected}
            className="bg-white/20 border-white/30 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:border-indigo-400 transition-all duration-300 animate-fade-in-up"
          />

          {!isConnected && (
            <div className="relative">
              <select
                value={selectedWallet || ''}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="w-full p-3 bg-white/20 text-white border-white/30 rounded-xl focus:border-indigo-400 transition-all duration-300 animate-fade-in-up appearance-none pr-10"
              >
                <option value="" disabled className="text-gray-400">Select EVM Wallet</option>
                {walletOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaWallet className="text-white" />
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleButtonAction}
            disabled={loading || (!isConnected && !selectedWallet)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {isConnected ? "Verifying..." : "Connecting..."}
              </div>
            ) : isConnected ? (
              'Sign In with zkProof'
            ) : (
              'Connect Wallet'
            )}
          </Button>

          {isConnected && (
            <Button
              type="button"
              onClick={handleDisconnect}
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