import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect } from 'wagmi';
import { injected } from '@wagmi/connectors';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleWalletConnect = async () => {
    setLoading(true);
    try {
      connect({ connector: injected({ target: 'metaMask' }) });
      console.log('Wallet connected:', address);
    } catch (error) {
      console.error('Wallet connect failed:', error);
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
        </form>
        <p className="text-center text-gray-400 mt-6 animate-fade-in-up">
          New here? <a href="/signup" className="text-indigo-300 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;