import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect } from 'wagmi';
import { injected } from '@wagmi/connectors';
import zkEngageBanner from '@/assets/zkEngagebanner.png';

const SignUpPage: React.FC = () => {
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
    // Simulate proof generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
        <div className="relative hidden md:block">
          <img src={zkEngageBanner} alt="Join zkEngage" className="w-full h-full object-cover animate-fade-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in-up">Welcome to the Future</h2>
              <p className="text-gray-300 animate-fade-in-up">Prove, Engage, Reward—Privately.</p>
            </div>
          </div>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white mb-6 text-center animate-fade-in">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Wallet Address"
              value={isConnected ? address || '' : ''}
              readOnly={isConnected}
              className="bg-white/20 border-white/30 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:border-pink-400 transition-all duration-300 animate-fade-in-up"
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
                  'Sign Up with zkEngage'
                )}
              </Button>
            )}
          </form>
          <p className="text-center text-gray-400 mt-4 animate-fade-in-up">
            Already have an account? <a href="/login" className="text-pink-300 hover:underline">Login In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;