import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { useAuth } from "@/hooks/useAuth";

const SignupPage: React.FC = () => {
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

    const signupWithWallet = async () => {
      setLoading(true);
      try {
        console.log("Wallet connected for signup:", address);

        const res = await fetch(`${API_URL}/api/auth/wallet-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend error:", text);
          alert("Wallet signup failed");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/home");
        } else {
          alert("Wallet signup failed: no token received");
        }
      } catch (err) {
        console.error("Wallet signup failed:", err);
        alert("Wallet signup failed");
      } finally {
        setLoading(false);
      }
    };

    signupWithWallet();
  }, [isConnected, address, navigate]);

  const handleWalletSelect = async (walletType: string) => {
    if (loading) return;
    
    setSelectedWallet(walletType);
    setLoading(true);
    
    try {
      let connector;
      switch (walletType) {
        case 'walletconnect':
          connector = walletConnect({ 
            projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id' 
          });
          break;
        case 'coinbaseWallet':
          connector = coinbaseWallet({ 
            appName: 'zkEngage',
            appLogoUrl: 'https://your-app-logo.com/logo.png' 
          });
          break;
        default:
          connector = injected({ target: 'metaMask' });
      }
      await connect({ connector });
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect wallet. Ensure the extension is installed and unlocked.");
      setLoading(false);
      setSelectedWallet(null);
    }
  };

  const handleZkProofVerification = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock zkProof
    setLoading(false);
    alert("zkProof verification simulated - proceed to home (mock)");
    navigate("/home");
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedWallet(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const walletOptions = [
    { 
      value: 'injected', 
      label: 'MetaMask', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0Y2ODUxQiIvPgo8cGF0aCBkPSJNMjQuNjI2OSA3LjEyNUwxNy4zMjU2IDEyLjIzNzVMMTguNzk4MSA4Ljk4NzVMMjQuNjI2OSA3LjEyNVoiIGZpbGw9IiNFMTc3MjYiLz4KPHA+PC9zdmc+Cg==',
      bgColor: 'bg-orange-500/20 hover:bg-orange-500/30'
    },
    { 
      value: 'walletconnect', 
      label: 'Rainbow Wallet', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iMCIgeTE9IjAiIHgyPSIzMiIgeTI9IjMyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjAwRkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDA4OEZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4=',
      bgColor: 'bg-indigo-500/20 hover:bg-indigo-500/30'
    },
    { 
      value: 'coinbaseWallet', 
      label: 'Coinbase Wallet', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwNTJGRiIvPgo8cGF0aCBkPSJNMTYgOEMxMS41ODE3IDggOCAxMS41ODE3IDggMTZTMTEuNTgxNyAyNCAxNiAyNFMyNCAyMC40MTgzIDI0IDE2UzIwLjQxODMgOCAxNiA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
      bgColor: 'bg-blue-500/20 hover:bg-blue-500/30'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">Create Account</h1>
          <p className="text-gray-300 animate-fade-in-up">Connect your wallet to get started</p>
        </div>

        <div className="space-y-6">
          {/* Wallet Address Display */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Wallet Address</label>
            <Input
              type="text"
              placeholder="Connect your wallet to see address"
              value={isConnected ? address || '' : ''}
              readOnly={true}
              className="bg-white/20 border-white/30 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:border-indigo-400 transition-all duration-300 animate-fade-in-up"
            />
          </div>

          {/* Wallet Selection */}
          {!isConnected && (
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold">Choose Your Wallet</h3>
              <div className="grid gap-3">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.value}
                    onClick={() => handleWalletSelect(wallet.value)}
                    disabled={loading}
                    className={`
                      w-full p-4 rounded-xl border border-white/20 transition-all duration-300
                      ${wallet.bgColor} 
                      ${selectedWallet === wallet.value ? 'ring-2 ring-white/50' : ''}
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                      flex items-center space-x-4
                    `}
                  >
                    <img 
                      src={wallet.image} 
                      alt={wallet.label}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to colored circle if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLDivElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 items-center justify-center text-white font-bold hidden">
                      {wallet.label.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{wallet.label}</p>
                      <p className="text-gray-300 text-sm">
                        {loading && selectedWallet === wallet.value ? 'Connecting...' : 'Click to connect'}
                      </p>
                    </div>
                    {loading && selectedWallet === wallet.value && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected State Actions */}
          {isConnected && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-medium">Wallet Connected Successfully</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleZkProofVerification}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying zkProof...
                  </div>
                ) : (
                  'Complete Sign Up with zkProof'
                )}
              </Button>

              <Button
                type="button"
                onClick={handleDisconnect}
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-500/30"
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 mt-8 animate-fade-in-up">
          Already have an account? 
          <a href="/login" className="text-indigo-300 hover:text-indigo-200 ml-1 hover:underline transition-colors">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;