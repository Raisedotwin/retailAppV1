import React, { useState, useMemo, useCallback } from 'react';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth'; // Import usePrivy hook
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';


interface SwapFormProps {
  balance: string;
  profile: any; // Adjust type based on the profile structure
}

const SwapForm: React.FC<SwapFormProps> = ({ balance, profile }) => {
  const { account } = useAccount();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [amount, setAmount] = useState('');
  const [balanceTwo, setBalanceTwo] = useState('0');
  const [profit, setProfit] = useState('');
  const [buyback, setBuyback] = useState('');

  const [activeTab, setActiveTab] = useState('buy');

  const [tokenAddress, setTokenAddress] = useState('');

  
  
  const [isInputModalVisible, setIsInputModalVisible] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const handleSelectToken = (token: any) => {
    setInputToken(`${token.name} (${token.address})`);
    setIsInputModalVisible(true);
  };


  const { user } = usePrivy(); // Use the usePrivy hook

  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile");


  const nativeAddress = user?.wallet?.address;
  const { wallets } = useWallets(); // Use useWallets to get connected wallets
  //const wallet = wallets[0]; // Use the first connected wallet
  const wallet = getEmbeddedConnectedWallet(wallets);

  const wethAddress = "0x4200000000000000000000000000000000000006"; // WETH address

  const onSelectToken = (token: any) => {
    setInputToken(`${token.name} (${token.address})`);
  };

   // Get the EIP-1193 provider from Privy
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

  //const privyProvider = await getPrivyProvider(); // Get Privy provider
  //const signer = privyProvider?.getSigner(); // Get signer

  const baseRpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(baseRpcURL), [baseRpcURL]);

    // Memoizing the profileContract to avoid re-creation on every render
  const profileContract = useMemo(() => {
      return new ethers.Contract(profileAddr, profileABI, provider);
  }, [profileAddr, profileABI, provider]);

  const fetchContractBalance = useCallback(async () => {
    try {
      const profile = await profileContract.getProfile(nativeAddress);
      console.log("profile", profile);
  
      if (profile[5] !== "0x0000000000000000000000000000000000000000") {
        const addr = profile[5];
        const traderPoolInstance = new ethers.Contract(addr, tokenPoolABI, provider);
        console.log("traderPoolInstance", traderPoolInstance);
  
        if (inputToken && inputToken !== wethAddress) {
          const tokenBalance = await traderPoolInstance.getTokenBalance(inputToken);
          const balanceOfTokenEther = ethers.formatEther(tokenBalance);
          console.log("Token Balance", tokenBalance);
          console.log("Token Balance in Ether", balanceOfTokenEther);
  
          if (tokenBalance.isZero()) {
            setBalanceTwo('No balance');
          } else {
            setBalanceTwo(balanceOfTokenEther);
          }
        } else {
          let contractBalance = await traderPoolInstance.getTotal();
          let contractBalanceEther = ethers.formatEther(contractBalance);
  
          if (contractBalance.isZero()) {
            setBalanceTwo('0');
          } else {
            setBalanceTwo(contractBalanceEther);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      setBalanceTwo('Error fetching balance');
    }
  }, [inputToken, nativeAddress, profileContract, provider, tokenPoolABI]);

  const handleSwap = async () => {
    if (profileContract && wallet) {
      setModalMessage('Swapping tokens');
      setIsModalVisible(true);
      try {

        getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
        //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
        const privyProvider = await wallet.getEthersProvider(); // Get Privy provider
        const signer: any  = privyProvider?.getSigner(); // Get signer

        const profileContractTwo = new ethers.Contract(profileAddr, profileABI, signer);

        const profile = await profileContractTwo.getProfile(nativeAddress);
        console.log("profile", profile);

        if (profile[5] !== "0x0000000000000000000000000000000000000000") {
          const addr = profile[5];
          const traderPoolInstance = new ethers.Contract(addr, tokenPoolABI, signer);
          console.log("traderPoolInstance", traderPoolInstance);
          console.log("address", traderPoolInstance.address);
          //const walletSigner = signer.connect(traderPoolInstance);

          if (traderPoolInstance) {
            if (!tradeAmount) {
              setTradeAmount('0');
            }

            const amountEther = ethers.parseEther(tradeAmount);
            console.log("spendAmount in Wei:", amountEther);

            if (inputToken === "0x4200000000000000000000000000000000000006") {
              console.log("Token Used In This Swap", inputToken);
              console.log("Bought position With WETH", outputToken);

              let balance = await traderPoolInstance.getBalance(traderPoolInstance.address);
              let balanceInEther = ethers.formatEther(balance);
              console.log(`Balance of traderPoolInstance: ${balanceInEther} ETH`);

              if (balance.isZero()) {
                const tokenBalance = await traderPoolInstance.getTokenBalance(inputToken);
                const balanceOfTokenEther = ethers.formatEther(tokenBalance);
                console.log("WETH Balance", tokenBalance);
                console.log("WETH Balance in Ether", balanceOfTokenEther);

                if (tokenBalance.isZero()) { 
                  setModalMessage('Insufficient balance in contract');
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  setIsModalVisible(false);
                  return;

                } else {
                   balance = tokenBalance;
                   balanceInEther = balanceOfTokenEther;
                   console .log(`Balance of traderPoolInstance: ${balanceInEther} ETH`);  
                   console.log("Balance of traderPoolInstance in Wei", balance);
                }
              }

              if (balance >= amountEther && tradeAmount !== "0") {
                //const estimatedGas = await traderPoolInstance.estimateGas.poolTrade(inputToken, outputToken, amountEther);
                //const gasPrice = await provider.getGasPrice();
                const depositTx = await traderPoolInstance.poolTrade(inputToken, outputToken, amountEther, { 
                  //gasLimit: estimatedGas,
                  //gasPrice: gasPrice 
                });
                await depositTx.wait();
                alert('Traded specified amount');
                setModalMessage('Swap Successful');
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsModalVisible(false);
                fetchContractBalance();
              } else {
                //const estimatedGas = await traderPoolInstance.estimateGas.poolTrade(inputToken, outputToken, balance);
                //const gasPrice = await provider.getGasPrice();
                const depositTx = await traderPoolInstance.poolTrade(inputToken, outputToken, balance, 
                  { 
                    //gasLimit: estimatedGas, 
                   //gasPrice: gasPrice 
                  });
                await depositTx.wait();
                alert('Traded all available balance');
                 
                setModalMessage('Swap Successful');
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsModalVisible(false);

                fetchContractBalance();

              }

            } else {
              console.log("Token Used In This Swap", inputToken);
              console.log("Sold position for Weth", outputToken);

              const tokenBalance = await traderPoolInstance.getTokenBalance(inputToken);
              const balanceOfTokenEther = ethers.formatEther(tokenBalance);
              console.log("Token Balance", tokenBalance);
              console.log("Token Balance in Ether", balanceOfTokenEther);

              if (tokenBalance.isZero()) {
                alert('Insufficient token balance in contract');
                setModalMessage('Insufficient token balance in contract');
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsModalVisible(false);
                return;
              }

              if (tokenBalance >= amountEther && tradeAmount !== "0") {
                //const estimatedGas = await traderPoolInstance.estimateGas.poolTrade(inputToken, outputToken, amountEther);
                //const gasPrice = await provider.getGasPrice();
                const depositTx = await traderPoolInstance.poolTrade(inputToken, outputToken, amountEther, { 
                  //gasLimit: estimatedGas, 
                  //gasPrice: gasPrice 
                });
                await depositTx.wait();
                alert('Traded specified amount');

                const profit = await traderPoolInstance.recentProfit();
                console.log("Profit", profit);

                const profitInEther = ethers.formatEther(profit);
                console.log("Profit in Ether", profitInEther);

                const profitInUSD = parseFloat(profitInEther);
                console.log("Profit in USD", profitInUSD);

                if (profitInUSD > 0) {
                  setProfit(profitInEther.toString());
                  console.log("Profit in USD", profitInUSD);
                }

                const lastBuyback = await traderPoolInstance.lastSharePurchase();
                console.log("Last Buyback", lastBuyback);

                if (lastBuyback > 0) {
                  setBuyback(lastBuyback.toString());
                }

                setModalMessage('Swap Successful'); //set the buyback number 
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsModalVisible(false);
                fetchContractBalance();
              } else {
                //const estimatedGas = await traderPoolInstance.estimateGas.poolTrade(inputToken, outputToken, tokenBalance);
                //const gasPrice = await provider.getGasPrice();
                const depositTx = await traderPoolInstance.poolTrade(inputToken, outputToken, tokenBalance, { 
                  //gasLimit: estimatedGas, 
                  //gasPrice: gasPrice 
                });
                await depositTx.wait();

                const profit = await traderPoolInstance.recentProfit();
                console.log("Profit", profit);

                const profitInEther = ethers.formatEther(profit);
                console.log("Profit in Ether", profitInEther);

                const profitInUSD = parseFloat(profitInEther)
                console.log("Profit in USD", profitInUSD);

                if (profitInUSD > 0) {
                  setProfit(profitInEther.toString());
                  console.log("Profit in USD", profitInUSD);
                }

                const lastBuyback = await traderPoolInstance.lastSharePurchase();
                console.log("Last Buyback", lastBuyback);

                if (lastBuyback > 0) {
                  setBuyback(lastBuyback.toString());
                } 

                setModalMessage('Swap Successful'); //set the buyback number 
                await new Promise((resolve) => setTimeout(resolve, 500));
                setIsModalVisible(false);
                fetchContractBalance();
              }
            }
          } else {
            alert('Trader Pool instance not available');
            setModalMessage('Trader Pool instance not available'); //set the buyback number 
            await new Promise((resolve) => setTimeout(resolve, 500));
            setIsModalVisible(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Authentication Failed');
        setModalMessage('Authentication Failed'); //set the buyback number 
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
        return;
      }
    } else {
      alert('Raise wallet was not initialized');
      return;
    }
  };

  return (
    <div className="bg-[#1c1f2a] rounded-2xl border border-gray-800 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-6">
          {/* Header with Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center mb-2">
              Swap Tokens
            </h2>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">{balance} WETH</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'buy' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'sell' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Buy Form */}
          {activeTab === 'buy' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">From</span>
                  <div className="flex items-center space-x-2">
                    <Image src="/icons/ethereum.png" alt="WETH" width={20} height={20} />
                    <span className="text-white font-medium">WETH</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter WETH amount"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">To</span>
                  <span className="text-gray-400 text-sm">Any token</span>
                </div>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter token address"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button
                onClick={handleSwap}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Buy Tokens
              </button>

              <p className="text-gray-400 text-sm text-center">
                You can only buy tokens using WETH
              </p>
            </div>
          )}

          {/* Sell Form */}
          {activeTab === 'sell' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">From</span>
                  <span className="text-gray-400 text-sm">Any token</span>
                </div>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter token address"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">To</span>
                  <div className="flex items-center space-x-2">
                    <Image src="/icons/ethereum.png" alt="WETH" width={20} height={20} />
                    <span className="text-white font-medium">WETH</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to sell"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <button
                onClick={handleSwap}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Sell for WETH
              </button>

              <p className="text-gray-400 text-sm text-center">
                All tokens will be sold for WETH
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1c1f2a] rounded-xl p-6 border border-gray-800 flex flex-col items-center">
            <Image src="/icons/waitlogo.png" alt="Processing" width={120} height={120} />
            <p className="mt-4 text-white font-medium">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapForm;
