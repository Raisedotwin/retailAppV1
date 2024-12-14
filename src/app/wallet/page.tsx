"use client";

import React from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth'; // Import usePrivy hook
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';

const WalletPage: React.FC = () => {
  const { account } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.00');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loggedInToX, setLoggedIntoX] = useState(false);

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const { login, logout, user } = usePrivy(); // Use the usePrivy hook

  const { wallets } = useWallets(); // Use useWallets to get connected wallets

  //in the trading panel we will specify either or
  //const wallet = wallets[0] // Get the first connected wallet privy wallet specifiy privy wallet
  const wallet = getEmbeddedConnectedWallet(wallets);

  const nativeAddress = user?.wallet?.address;

  const tokenPoolABI = require("../abi/traderPool");
  const traderPayoutsABI = require("../abi/traderPayouts");

  const tokenContractAddr = '0xc3369746eeC430A3D79EfA908698E1323333BB1d';
  const tokenMarketABI = require("../abi/tokenMarket");

  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile");

  const createAccountAddr = '0x65fe166D99CD92B0e19B4bAF47300A7866B9D249';
  const createAccountABI = require("../abi/createAccount");

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);
  const createContract = useMemo(() => new ethers.Contract(createAccountAddr, createAccountABI, provider), [createAccountAddr, createAccountABI, provider]);
  const tokenMarket = useMemo(() => new ethers.Contract(tokenContractAddr, tokenMarketABI, provider), [tokenContractAddr, tokenMarketABI, provider]);

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

  // Handle A Wallet Claim
  const handleWalletClaim = async () => {
    if (profileAddr && wallet) {
      setModalMessage('Claiming wallet...');
      setIsModalVisible(true);
      try {
        getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
        //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
        const privyProvider = await wallet.getEthersProvider(); // Get Privy provider
        const signer: any  = privyProvider?.getSigner(); // Get signer

        const profileContractTwo = new ethers.Contract(profileAddr, profileABI, signer);

        let username = user?.twitter?.username;
        let profile = await profileContractTwo.getProfileByName(username);
        let payouts = profile[6];

        if (profile[2] === username) {
          //const estimatedGas = await profileContract.estimateGas.claimProfile(nativeAddress, username, true);
          //const gasPrice = await provider?.getGasPrice();
          await profileContractTwo.claimProfile(nativeAddress, username, true, {
            //gasLimit: estimatedGas,
            //gasPrice: gasPrice,
          });
        } else {
          alert('Incorrect Twitter AUTH');
          return;
        }

        if (payouts !== "0x0000000000000000000000000000000000000000") {
          const traderPayoutsInstance = new ethers.Contract(payouts, traderPayoutsABI, signer);
          //const estimatedGas = await traderPayoutsInstance.estimateGas.withdraw();
          //let gasPrice = await provider?.getGasPrice();

          const ethBalance = await provider.getBalance(payouts);
          console.log('ETH Balance:', ethers.formatEther(ethBalance));
          const amountMsg = ethBalance.toString();

          // Increase gas price by 20% to avoid replacement fee issues
          //gasPrice = gasPrice.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100));
          const tx = await traderPayoutsInstance.withdraw();
          //const tx = await traderPayoutsInstance.withdraw({ gasLimit: estimatedGas, gasPrice });
          await tx.wait();

          setModalMessage('Congratulations! You have successfully earned ' + amountMsg);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);

        }
      } catch (error) {
        console.error('Error claiming wallet:', error);
        setModalMessage('Wallet Claim Failed');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);

      }
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.twitter?.username;
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        if (profile) {
          setProfileExists(true);
          return profile;
        } else {
          setProfileExists(false);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileExists(false);
    }
  }, [profileContract, user?.twitter?.username]);

  //This Worked So The Signer Is Correct
  const handleCreateWallet = async () => {
    if (createContract) {
      setModalMessage('Creating Wallet ...');
      setIsModalVisible(true);
      try {
        getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
        //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
        const privyProvider = await wallet?.getEthersProvider(); // Get Privy provider
        const signer: any  = privyProvider?.getSigner(); // Get signer

        const createContractTwo = useMemo(() => new ethers.Contract(createAccountAddr, createAccountABI, signer), [createAccountAddr, createAccountABI, signer]);

        const tempUserAddress = nativeAddress;
        const tempName = user?.twitter?.username;
        const tempBio = user?.twitter?.name;
        const tempAva = user?.twitter?.profilePictureUrl;
        const per = 0;

        //const estimatedGas = await createContract.estimateGas.createAccount(tempName, tempBio, tempAva, per, tempUserAddress);
        //const gasPrice = await provider.getGasPrice();

        const tx = await createContractTwo.createAccount(tempName, tempBio, tempAva, per, tempUserAddress, {
          //gasLimit: estimatedGas,
          //gasPrice: gasPrice
        });
        await tx.wait();
        handleBuySharesDirectly();
      } catch (error) {
        console.error('Error creating account:', error);
        setModalMessage('Error creating account');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      }
    } else {
      setModalMessage('Profile not intiaslized');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(false);
    }
  };

  const handleBuySharesDirectly = async () => {
    if (tokenMarket) {
      setModalMessage('Buying the first share');
      setIsModalVisible(true);
      try {
        getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
        //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
        const privyProvider = await wallet?.getEthersProvider(); // Get Privy provider
        const signer: any  = privyProvider?.getSigner(); // Get signer

        const tokenMarketTwo = useMemo(() => new ethers.Contract(tokenContractAddr, tokenMarketABI, signer), [tokenContractAddr, tokenMarketABI, signer]);

        const accountCounter = await fetchAccountCounter();
        if (accountCounter !== null) {
          //onst estimatedGas = await tokenMarketTwo.buyShares(accountCounter.toString(), "1", { value: ethers.parseEther("0") });
          //const gasPrice = await provider.getGasPrice();

          const tx = await tokenMarketTwo.buyShares(accountCounter.toString(), "1", {
            value: ethers.parseEther("0"),
            //gasLimit: estimatedGas,
            //gasPrice: gasPrice
          });
          await tx.wait();
          setModalMessage('Account Created Successfully');
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);
        } else {
          setModalMessage('Error creating account');
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error('Error buying shares:', error);
        setModalMessage('Error creating account');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      }

    } else {
      setModalMessage('Error creating account');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(false);
    }
  };

  const loginWithPrivy = async () => {
    try {
      await login();
      console.log('Logged in with Privy:', user);
    } catch (error) {
      console.error('Error logging in with Privy:', error);
    }
  };

  const logoutWithPrivy = async () => {
    try {
      await logout();
      console.log('Logged out with Privy');
    } catch (error) {
      console.error('Error logging out with Privy:', error);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      try {
        if(user?.twitter?.username) {
          setLoggedIntoX(true);

          let profile = await fetchProfile();

          if (profile && profile.length > 5) {
            const traderPoolAddr = profile[5];
            console.log(traderPoolAddr);

            const traderAcc = profile[1];
            console.log("trader account", traderAcc.toString());

            if (traderPoolAddr) {
              const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
              //console.log(traderPoolInstance);
              const balance = await traderPoolInstance.getNativeBalanceView();
              console.log("balance", balance);
              setEthBalance(ethers.formatEther(balance));
              console.log(balance);
            }
          } else {
            console.log('Profile does not contain sufficient data.');
          }
        } else {
          setLoggedIntoX(false);
        }

      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [
    user,
    fetchProfile,
    tokenPoolABI
  ]);


  const fetchAccountCounter = useCallback(async () => {
    if (createContract) {
      try {
        const accCounter = await createContract.accountCounter();
        return accCounter.toNumber();
      } catch (error) {
        console.error('Error fetching account counter:', error);
        return null;
      }
    }
    return null;
  }, [createContract]);

 
  return (
    <div className="min-h-screen bg-black flex flex-col p-6">
      <div className="max-w-3xl w-full mx-auto p-8 bg-gray-900 rounded-lg shadow-lg flex flex-col">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Raise Wallet:</h2>
              {profileExists ? (
                <button
                  type="button"
                  onClick={handleWalletClaim}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
                >
                  Claim
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateWallet}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
                >
                  Create
                </button>
              )}
            </div>
            <div>
              <Link href="/positions">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow-lg hover:from-orange-500 hover:to-purple-600 transition duration-300 cursor-pointer">
                  Positions
                </div>
              </Link>
            </div>
          </div>

          {user?.wallet?.address ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Connected Address:</h3>
              <p className="text-gray-400 break-words">{user?.wallet?.address}</p>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">No Address Connected</h3>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="mb-8">
          <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Available Balance</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                {ethBalance} ETH
              </p>
            </div>
          </div>
        </div>
        
        {/* Video Guide Section */}
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            How To Use Your Raise Wallet
          </h2>
          <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <video 
              controls 
              className="w-full h-full object-cover"
              poster="/api/placeholder/400/320"
            >
              <source src="/path-to-your-wallet-guide-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Modals */}
        {!loggedInToX && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
              <Image src="/icons/logo.png" alt="Twitter Icon" width={120} height={120} />
              <br />
              <p className="mb-2 text-gray-700 font-semibold">Please Authenticate With X To View Wallet</p>
              <div className="mt-4">
                <button
                  onClick={loginWithPrivy}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalVisible && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
              <Image src="/icons/waitlogo.png" alt="Twitter Icon" width={120} height={120} />
              <p className="mb-2 text-gray-700 font-semibold">{modalMessage} ... </p>
            </div>
          </div>
        )}

        {showCreateWalletModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md">
              <p className="text-lg">Create wallet for trader?</p>
              <div className="flex justify-end mt-4">
                <button 
                  className="mr-2 px-4 py-2 bg-green-500 text-white rounded-lg" 
                  onClick={handleCreateWallet}
                >
                  Create Wallet
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg" 
                  onClick={() => setShowCreateWalletModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;

