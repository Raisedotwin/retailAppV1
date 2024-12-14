"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';

const AffiliatePage: React.FC = () => {
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliateId, setAffiliateId] = useState('');
  const [referrer, setReferrer] = useState<string | null>(null);
  const { user } = usePrivy(); // Assuming user authentication
  const { wallets } = useWallets(); // Assuming wallet integration

  // Extract search parameters with a Suspense boundary
  const SearchParamsWrapper = () => {
    const searchParams = useSearchParams();
    const affiliate = searchParams.get('affiliate');
    useEffect(() => {
      setReferrer(affiliate);
    }, [affiliate]);
    return null; // No UI from here, just state management
  };

  useEffect(() => {
    const wallet = user?.wallet?.address;
    if (wallet) {
      const affiliateId = wallet; // Use wallet address as affiliate ID
      setAffiliateId(affiliateId);
      // Set affiliate link for sharing (ensure window.location is used only on the client)
      setAffiliateLink(`${window.location.origin}/wallet?affiliate=${affiliateId}`);
    }
  }, [user?.wallet?.address]);

  // Store affiliate ID locally
  useEffect(() => {
    if (referrer) {
      localStorage.setItem('affiliateId', referrer);
    }
  }, [referrer]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper />
      <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Affiliate Link Generator</h1>

        {/* Affiliate Link Display */}
        {affiliateId && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md text-center">
            <p>Your Affiliate ID:</p>
            <p className="text-blue-500 font-mono">{affiliateId}</p>
            <p className="mt-4">Share this link to earn rewards:</p>
            <input
              type="text"
              value={affiliateLink}
              readOnly
              className="w-full p-2 mt-2 text-gray-700 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        {/* If visiting with an affiliate link */}
        {referrer && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            <p>Affiliate Referrer ID: {referrer}</p>
            <p>You are supporting this affiliate.</p>
          </div>
        )}

        {/* Links for testing */}
        <div className="mt-8">
          <Link href="/wallet">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md">
              Go to Wallet Page
            </button>
          </Link>
        </div>
      </div>
    </Suspense>
  );
};

export default AffiliatePage;
