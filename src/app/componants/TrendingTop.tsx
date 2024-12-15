import React, { useState } from 'react';

const HowItWorks = () => {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const steps = [
    {
      number: '01',
      title: 'Fundraise',
      description: "Sign in with your X account to create a token. Alternatively, create a token for a friend by searching for their account. Your token will trade on a curve, and the fees will fund your Raise wallet.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      number: '02',
      title: 'Trading',
      description: "As your wallet gathers funds, you can trade them on supported platforms (NFTs, swaps, and perps). You can take a percentage of the profits whenever you sell. All settlements are in WETH.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      )
    },
    {
      number: '03',
      title: 'Auto Buybacks',
      description: "Whenever a sale is made, 70% of the proceeds will go toward buying back the trader tokens. This will help increase the tokens' value and provide liquidity.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    }
  ];

  const faqs = [
    {
      question: 'What is shorting and how does it work?',
      answer: 'Raise provides a built in marketplace to short trader tokens, allowing you to profit from a token price decrease.'
    },
    {
      question: 'How do you trackl buybacks?',
      answer: 'Raise offers a panel where you can view a buyback frequencyt counter to see often the trader is selling. Whenever positions are sold the buy back is made.'
    },
    {
      question: 'What is the token tax?',
      answer: 'Raise tokens can be traded anywhere on the Ethereum network. A 50% tax is applied to specific addresses (Uniswap and others) to incentivize purchasing on Raise first. eventually taxes will be phased out as the platform grows.'
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A simple three-step process to participate in decentralized trading
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className="relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                {step.icon}
              </div>
              <div>
                <span className="text-sm text-blue-600 font-semibold">Step {step.number}</span>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
            </div>
            <p className="text-gray-600">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 text-gray-300">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M15 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-3xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                <span className="font-semibold">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    selectedFaq === index ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`px-6 pb-4 transition-all duration-300 ${
                  selectedFaq === index ? 'block' : 'hidden'
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;