import React, { useState } from 'react';
import Image from 'next/image';
const ChevronDown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

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

const AnimatedHeader = () => (
  <div className="relative flex flex-col items-center justify-center mb-16">
    <div className="flex items-center justify-center gap-6 mb-8">
      <div className="transform hover:rotate-6 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={64}
          height={64}
          className="animate-pulse"
        />
      </div>
      <h1 className="text-4xl font-bold text-gray-900">
        Get Started
      </h1>
      <div className="transform hover:-rotate-6 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={64}
          height={64}
          className="animate-pulse"
        />
      </div>
    </div>
    
    <a 
      href="https://docs.google.com/document/d/1OH1hj-01vZyqifnXKdaqFqg8WARIBXEhnXe7A81uN5w/edit?tab=t.6bncxdjw1hly"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 px-6 py-3 mb-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
    >
      <span className="font-medium">View Full Documentation</span>
      <ExternalLinkIcon />
    </a>

    <div className="relative group">
      <div className="relative px-8 py-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xl font-medium text-center">
          <span className="font-semibold text-gray-900">
            Find an X account, tokenize it, claim it to start trading
          </span>
          <span className="text-gray-600 mt-3 block text-base">
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
    <div className="absolute inset-0 bg-indigo-100 rounded-xl blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
    <div className="relative w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white transform group-hover:scale-105 transition-all duration-300">
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
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <section className="max-w-6xl mx-auto px-4 py-16 bg-gray-50">
      <AnimatedHeader />
      
      <div className="grid gap-8 md:grid-cols-3 mb-20">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className="group relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <FunIcon icon={step.icon} />
              <div>
                <span className="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-3">
                  Step {step.number}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M15 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-2xl font-semibold text-center mb-8 text-gray-900">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-lg hover:border-indigo-100 transition-colors duration-300"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                <span className="text-base font-medium text-gray-900">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    selectedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`px-6 transition-all duration-300 overflow-hidden ${
                  selectedFaq === index ? 'max-h-48 pb-4' : 'max-h-0'
                }`}
              >
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;