import React, { useState } from 'react';
import Image from 'next/image';

const ExternalLinkIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const AnimatedHeader = () => (
  <div className="relative flex flex-col items-center justify-center mb-20">
    <div className="flex items-center justify-center gap-8 mb-8">
      <div className="transform hover:rotate-12 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={80}
          height={80}
          className="animate-pulse"
        />
      </div>
      <h1 className="text-5xl font-bold text-black">
        Get Started
      </h1>
      <div className="transform hover:-rotate-12 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={80}
          height={80}
          className="animate-pulse"
        />
      </div>
    </div>
    
    {/* Documentation Link */}
    
    <a 
      href="https://docs.google.com/document/d/1OH1hj-01vZyqifnXKdaqFqg8WARIBXEhnXe7A81uN5w/edit?tab=t.6bncxdjw1hly"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 px-6 py-3 mb-12 bg-black text-white rounded-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <span className="font-semibold">View Full Documentation</span>
      <ExternalLinkIcon />
    </a>

    <div className="relative group">
      <div className="absolute -inset-0.5 bg-black rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative px-8 py-6 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
        <p className="text-2xl font-medium text-center">
          <span className="font-bold text-black">
            Find an X account, tokenize it, claim it to start trading
          </span>
          <br />
          <span className="text-gray-600 mt-4 block">
            BUY $NUGGET for extra rewards{' '}
            <span className="animate-bounce inline-block">📈</span>
          </span>
        </p>
      </div>
    </div>
  </div>
);

const FunIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-black/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
    <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-black rounded-2xl flex items-center justify-center text-white transform group-hover:scale-110 transition-all duration-300 shadow-lg">
      {icon}
    </div>
  </div>
);

const HowItWorks = () => {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const steps = [
    {
      number: '01',
      title: 'Create Tokens',
      description: "Look up an X account and create a token. If you're the owner, claim and start trading. Create accounts for others and await their claims.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    },
    {
      number: '02',
      title: 'Create Profit',
      description: "6% funding rate on all token trading, fluctuating with creator's performance. Proceeds fund a raise wallet for perps and memes trading.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <circle cx="12" cy="12" r="1"/>
          <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5"/>
        </svg>
      )
    },
    {
      number: '03',
      title: 'Create Pumps',
      description: "Revenue automatically buys back creator tokens. Underperformance triggers sellbacks, distributing profits to users.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8c2 2.5 2 6.5 0 9M6 8c-2 2.5-2 6.5 0 9"/>
          <path d="M12 8v8M12 3v3M12 18v3M15 5l-3-3-3 3"/>
        </svg>
      )
    }
  ];


  const faqs = [
    {
      question: "What is the funding rate?",
      answer: "The funding rate is Raise's transaction tax on creator tokens. It can be stable or fluctuate based on creator revenue performance. Week 1 starts with a 6% funding rate for all."
    },
    {
      question: "What are buybacks and sellbacks?",
      answer: "Raise uses buybacks and sellbacks to soft peg token value to the ongoing performance of an AI agent or human creator."
    },
    {
      question: 'How do I buy trader tokens?',
      answer: "Visit the 'Creators' tab to browse existing accounts or create new ones by entering an X username. 'Inactive' status means the creator hasn't claimed their account yet. Pre-claim trading fees are held in escrow until claimed."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-gray-50">
      <AnimatedHeader />
      
      {/* Steps */}
      <div className="grid gap-8 lg:gap-12 md:grid-cols-3 mb-24">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center gap-8">
              <FunIcon icon={step.icon} />
              <div>
                <span className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-100 to-gray-100 rounded-full text-sm font-bold text-yellow-600 mb-3">
                  Step {step.number}
                </span>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-yellow-400">
                <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M15 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-12 shadow-xl">
        <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-500 to-black bg-clip-text text-transparent">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-2xl hover:border-yellow-200 transition-colors duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center"
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                <ChevronDownIcon />
              </button>
              <div
                className={`px-8 transition-all duration-300 overflow-hidden ${
                  selectedFaq === index ? 'max-h-48 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;