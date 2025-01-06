import React, { useState } from 'react';
import Image from 'next/image';

const AnimatedHeader = () => (
  <div className="relative flex flex-col items-center justify-center mb-16">
    <div className="flex items-center justify-center gap-8 mb-6">
      <div className="transform hover:rotate-12 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={70}
          height={70}
          className="animate-pulse"
        />
      </div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Getting Started!
      </h2>
      <div className="transform hover:-rotate-12 transition-transform duration-300">
        <Image
          src="/icons/logo.png"
          alt="NFT Marketplace"
          width={70}
          height={70}
          className="animate-pulse"
        />
      </div>
    </div>
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative px-8 py-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-xl">
        <p className="text-xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          <span className="font-bold">DM @MrSatler or @RomanCola on TG to become a trader</span>, $NUGGET holders{' '}
          get  whitelist priority{' '}
          <span className="animate-pulse inline-block">📈</span>
        </p>
      </div>
    </div>
  </div>
);

const FunIcon = ({ icon }: { icon: JSX.Element }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
    <div className="relative flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-transform">
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
      description: "Look up an X account and create a token, if the token gets enough trading volume the owner of the X account will be automically whitelisted.",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6v12" strokeDasharray="2 2"/>
        </svg>
      )
    },
    {
      number: '02',
      title: 'Create Profit',
      description: "Fees from token trading are sent to a raise wallet, from the raise wallet the account owner can trade NFTs or Swap on partnered platforms. All trades are settled are in WETH.",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <circle cx="12" cy="12" r="1"/>
          <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5"/>
        </svg>
      )
    },
    {
      number: '03',
      title: 'Create Pumps',
      description: "Whenever a token 'creator' sells a perp, nft or swap, 70% of the proceeds will go toward buying back the trader tokens. The other 30% is kept by the trader to use however they see fit.",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8c2 2.5 2 6.5 0 9M6 8c-2 2.5-2 6.5 0 9"/>
          <path d="M12 8v8"/>
          <path d="M12 3v3"/>
          <path d="M12 18v3"/>
          <path d="M15 5l-3-3-3 3"/>
        </svg>
      )
    }
  ];

  const faqs = [
    {
      question: 'What are options and how do they work?',
      answer: 'Raise allows token holders to write options on their trader tokens. Writing options allows holders to sell tokens at price "a strike price" of their choosing within a specified expiry date. In return the token holder gets to collect a premium or a fee paid to them by the buyer of their options contract. If the buyer chooses to execute the contract within the expiry period they will purchase the tokens from the original token holder at the strike price. If the buyer chooses not to execute the contract the token holder keeps the premium and the contract expires worthless, the token holder will then re collect their tokens.'
    },
    {
      question: 'How do you track buybacks?',
      answer: 'Raise has a panel where you can view a buyback frequency counter to see how often the trader is selling. Whenever positions are sold the buyback is made. You can also see a trader win rate and other stats.'
    },
    {
      question: 'How do I buy trader tokens?',
      answer: 'Go to the "traders" tab and click on already created trader accounts to navigate to the buy and sell buttons. Look up a trader by typing in their X username and create an account for them. If it gets enough trading volume we will whitelist them.'
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <AnimatedHeader />
      {/* Steps */}
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center gap-6 mb-4">
              <FunIcon icon={step.icon} />
              <div>
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-600 mb-2">
                  Step {step.number}
                </span>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-center">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 text-purple-300">
                <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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