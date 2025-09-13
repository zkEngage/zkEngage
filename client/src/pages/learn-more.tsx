import React from 'react';
import { Button } from '@/components/ui/button';
import { FaQuestionCircle } from 'react-icons/fa';

const LearnMorePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-16 px-4">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center mb-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent">
          Discover zkEngage
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 animate-fade-in-up">
          Empowering Web3 communities with privacy-preserving engagement through zero-knowledge proofs.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center animate-fade-in">Our Mission</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-left">
            <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
            <p className="text-gray-300">Use STARK proofs to verify actions without exposing wallet histories, ensuring user privacy.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-right">
            <h3 className="text-xl font-semibold mb-4">Gamified Engagement</h3>
            <p className="text-gray-300">Complete quests, earn badges, and build reputation—all secured by zkVerify.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center animate-fade-in">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What are zero-knowledge proofs?', a: 'ZKPs let you prove an action (e.g., completing a quest) without revealing details, using math to ensure privacy.' },
            { q: 'How do I earn badges?', a: 'Complete quests like wallet connections or social tasks. Our backend verifies via zkVerify, minting NFTs.' },
            { q: 'Is it cross-chain?', a: 'Yes! Badges and reputation are portable across EVM chains like Ethereum and Polygon.' },
          ].map((faq, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
              <h3 className="text-lg font-semibold flex items-center"><FaQuestionCircle className="mr-2" /> {faq.q}</h3>
              <p className="text-gray-300 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-lg transform hover:scale-105 hover:animate-pulse transition-all duration-300"
        >
          Join the Community
        </Button>
      </section>
    </div>
  );
};

export default LearnMorePage;