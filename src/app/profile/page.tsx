"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, useFundWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers'; // Assuming you're using ethers.js

const ProfilePage: React.FC = () => {
  const { account } = useAccount();
  const { user } = usePrivy();
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [transferTx, setTransferTx] = useState<string | null>(null);

  const { fundWallet } = useFundWallet();

  const {ready, authenticated} = usePrivy();
  const {wallets} = useWallets();

  let wallet: any;

  // Fetch wallet balance
  useEffect(() => {

    getBalance();

  }, [user?.wallet?.address]);

  const getPrivyProvider = async (chainName: string) => {
    if (!wallet) {
      console.error("Wallet not initialized");
      return null;
    }

    let chainId: number;

    switch (chainName.toLowerCase()) {
      case "avax":
        chainId = 43114;  // Example chain ID for Avalanche C-Chain
        break;
      case "base":
        chainId = 8453;  // Hypothetical chain ID for Base, adjust accordingly
        break;
      default:
        console.error("Unsupported chain name");
        return null;
      }

      try {
        await wallet.switchChain(chainId);
        return await wallet.getEthersProvider();
      } catch (error) {
        console.error("Failed to switch chain or get provider:", error);
        return null;
      }
  };

  async function getBalance() {

    if(user?.twitter?.username) {
        let embeddedWallet = getEmbeddedConnectedWallet(wallets);
        let privyProvider = await embeddedWallet?.address;
        wallet = wallets.find((wallet) => wallet.address === privyProvider);
      }

      //const signer = await provider.getSigner(user.wallet.address);
      getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
      //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
      const privyProvider = await wallet?.getEthersProvider(); // Get Privy provider
      const signer: any  = privyProvider?.getSigner(); // Get signer

      // Get user's Ethereum public address
      const address =   await signer?.getAddress();
      console.log(address);
  
      // Get user's balance in ether
      const balance = ethers.formatEther(
      (await privyProvider.getBalance(address)).toString() // balance is in wei
    );
    console.log(balance);
    setBalance(balance);
  }


  // Send money
  const handleSendMoney = async () => {

    if(user?.twitter?.username) {
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      let privyProvider = await embeddedWallet?.address;
      wallet = wallets.find((wallet) => wallet.address === privyProvider);
    }

    //const signer = await provider.getSigner(user.wallet.address);
    getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
    //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
    const privyProvider = await wallet?.getEthersProvider(); // Get Privy provider
    const signer: any  = privyProvider?.getSigner(); // Get signer
    
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther("0.1"),
      maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
      maxFeePerGas: "6000000000000", // Max fee per gas
    })
    const receipt = await tx.wait();
    console.log(receipt);
    setTransferTx(receipt.transactionHash)

  };

  // Handle Purchase Crypto (Fund Wallet)
  const handleFundWallet = async () => {
    let address: any = user?.wallet?.address;
    setIsSending(true);
    try {
      await fundWallet(address);
      alert('Funding initiated.');
    } catch (error) {
      console.error('Error funding wallet:', error);
      alert('Funding failed.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl w-full mx-auto bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Profile</h2>
          <div className="flex space-x-4">
            <Link href="/holdings">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow-md hover:from-orange-500 hover:to-purple-600 transition duration-300">
                Holdings
              </div>
            </Link>
            <button
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md hover:from-green-500 hover:to-blue-600 transition duration-300 cursor-pointer"
              onClick={handleFundWallet}
            >
              {isSending ? 'Processing...' : 'Purchase Crypto'}
            </button>
          </div>
        </div>
        
        {user?.wallet?.address ? (
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Connected Wallet</h3>
              <p className="text-gray-400">{user?.wallet?.address}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Wallet Balance</h3>
              <p className="text-gray-400">{balance ? `${balance} ETH` : 'Fetching balance...'}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Send Money</h3>
              <br />
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 mb-2 text-lg text-green-700 bg-gray-700 border border-gray-600 rounded-md"
              />
              <input
                type="text"
                placeholder="Amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 mb-4 text-lg text-green-700 bg-gray-700 border border-gray-600 rounded-md"
              />
              <button
                className="w-full py-2 bg-green-500 text-white rounded-lg"
                onClick={handleSendMoney}
              >
                {isSending ? 'Sending...' : 'Send Money'}
              </button>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
            <p>{transferTx ? `KLAY Successfully Transferred with: ${transferTx} hash` : "No Tx yet"}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white">No Wallet Connected</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
