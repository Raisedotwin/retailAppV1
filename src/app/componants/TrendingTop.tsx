import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <section className="mb-12">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>

      {/* Steps Section */}
      <div className="space-y-8">
        {/* Step 1 */}
        <div>
          <h3 className="text-xl font-semibold mb-2">1. Fundraise</h3>
          <p className="text-gray-600">
            Creators have a set period to fundraise the desired amount. This fair launch ensures everyone gets in at the same price. Once the goal is met, the protocol unlocks the next phase.
          </p>
        </div>

        {/* Step 2 */}
        <div>
          <h3 className="text-xl font-semibold mb-2">2. Trading (Fundraise Successful)</h3>
          <p className="text-gray-600">
            After fundraising, the funds are used to trade on supported platforms (e.g., perps, swaps). Token prices fluctuate based on the trading activity, creating a dynamic market curve with uncapped upside potential.
          </p>
        </div>

        {/* Step 3 */}
        <div>
          <h3 className="text-xl font-semibold mb-2">3. Fund Expiration</h3>
          <p className="text-gray-600">
            At expiration, the fund locks, and profits are distributed to token holders. You can redeem tokens for their underlying value or sell them on the market.
          </p>
        </div>
      </div>

      {/* FAQ Section (Optional) */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <p className="font-semibold">Why are DAO tokens mintable?</p>
          <p className="text-gray-600 mt-2">
            DAO tokens are mintable to ensure dynamic participation and funding flexibility.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
