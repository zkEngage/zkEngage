import React from 'react';
import { Button } from '@/components/ui/button';
import { FaLock, FaTrophy, FaGlobe } from 'react-icons/fa'; // Animated icons
import zkEngageBanner from '@/assets/zkEngagebanner.png';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const LandingPage: React.FC = () => {
  const featureCards: FeatureCard[] = [
    { icon: <FaLock className="animate-spin-slow" />, title: 'Private Proofs', desc: 'Verify actions without data leaks.' },
    { icon: <FaTrophy className="animate-bounce-slow" />, title: 'Earn Badges', desc: 'Unlock NFTs for real achievements.' },
    { icon: <FaGlobe className="animate-pulse" />, title: 'Web3 Ready', desc: 'Portable across chains.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
      {/* Parallax Hero Section */}
      <section className="relative py-20 px-4 md:px-8 parallax-section">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <img 
            src={zkEngageBanner} 
            alt="zkEngage Banner" 
            className="mx-auto mb-8 w-64 h-32 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent animate-fade-in">
            Unlock Private <span className="text-pink-300">Engagement</span> in Web3
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 animate-fade-in-up">
            Prove your activity with zero-knowledge. Earn badges, build reputation, and join quests—without revealing a thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
              onClick={() => window.location.href = '/signup' }
              data-testid="button-start-questing"
            >
              Start Questing
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-indigo-900 hover:animate-pulse transition-all duration-300"
              onClick={() => window.location.href = '/learn-more' }
              data-testid="learn-more-button"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {featureCards.map((card, i) => (
            <div 
              key={i} 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl hover:animate-pulse transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;