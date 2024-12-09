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

  const [isInputModalVisible, setIsInputModalVisible] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const handleSelectToken = (token: any) => {
    setInputToken(`${token.name} (${token.address})`);
    setIsInputModalVisible(true);
  };


  const { user } = usePrivy(); // Use the usePrivy hook

  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0x1dF214861B5A87F3751D1442ec7802d01c07072E';
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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <form onSubmit={handleSwap} className="p-10 bg-black rounded-lg shadow-md max-w-lg mx-auto">
        
        {/* Balance Box */}
        <div className="bg-gray-800 text-white p-4 rounded mb-6 text-center shadow-md">
          <p>Balance: {balance}</p> {/* Display balance */}
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Input Token</label>
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Token for purchase"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Output Token</label>
          <input
            type="text"
            value={outputToken}
            onChange={(e) => setOutputToken(e.target.value)}
            placeholder="Token for purchase"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>
  
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded w-full shadow-md"
        >
          Swap
        </button>
      </form>

      {/* Modal for Processing */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
            <Image src="/icons/waitlogo.png" alt="Twitter Icon" width={120} height={120} />
            <p className="mb-2 text-gray-700 font-semibold" >{modalMessage} ... </p>
              <div className="mt-4">
              </div>
           
          </div>
        </div>
      )}
      
    </div>
    
  );
};

export default SwapForm;
