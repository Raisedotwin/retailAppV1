import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import Image from 'next/image';

// Define interfaces to solve type errors
interface EditLaunchProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: string;
  activeContract: Contract | null;
  signer: ethers.Signer;
  onUpdateSuccess: (settingType: 'whitelist' | 'trading' | 'deliveryTime' | 'whitelistToggle') => void;
}

const EditLaunch: React.FC<EditLaunchProps> = ({ 
  isOpen, 
  onClose, 
  contractAddress, 
  activeContract,
  signer,
  onUpdateSuccess
}) => {
  // States for each editable field
  const [whitelistAddress, setWhitelistAddress] = useState<string>('');
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [isTradingDisabled, setIsTradingDisabled] = useState<boolean>(false);
  const [expectedDeliverySeconds, setExpectedDeliverySeconds] = useState<string>('');
  const [expectedDeliveryDays, setExpectedDeliveryDays] = useState<number>(0);
  const [expectedDeliveryHours, setExpectedDeliveryHours] = useState<number>(0);
  
  // Add state for whitelist toggle
  const [isWhitelistEnabled, setIsWhitelistEnabled] = useState<boolean>(false);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen && activeContract) {
      loadCurrentSettings();
    }
  }, [isOpen, activeContract]);

  // Convert days and hours to seconds when they change
  useEffect(() => {
    const days = parseInt(expectedDeliveryDays.toString()) || 0;
    const hours = parseInt(expectedDeliveryHours.toString()) || 0;
    const totalSeconds = (days * 24 * 60 * 60) + (hours * 60 * 60);
    setExpectedDeliverySeconds(totalSeconds.toString());
  }, [expectedDeliveryDays, expectedDeliveryHours]);

  // Convert seconds to days and hours when seconds change
  const convertSecondsToDaysAndHours = (seconds: string | number): { days: number, hours: number } => {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) || 0 : seconds;
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const remainingSeconds = totalSeconds % (24 * 60 * 60);
    const hours = Math.floor(remainingSeconds / (60 * 60));
    
    return { days, hours };
  };

  // Load current settings from the contract
  const loadCurrentSettings = async (): Promise<void> => {
    if (!activeContract) return;

    setIsProcessing(true);
    setProcessingMessage('Loading current settings...');
    
    try {
      // Try to load whitelist status
      try {
        const whitelistStatus = await activeContract.isWhitelistEnabled();
        setIsWhitelistEnabled(whitelistStatus);
      } catch (error) {
        console.log('Could not fetch whitelist status:', error);
      }
      
      // Try to load whitelisted addresses if the contract has that function
      try {
        // This is just a placeholder - your actual contract might have a different method
        const whitelist = await activeContract.getWhitelistedAddresses();
        setWhitelistedAddresses(whitelist || []);
      } catch (error) {
        console.log('Could not fetch whitelist:', error);
        // Whitelist function might not exist or be inaccessible
        setWhitelistedAddresses([]);
      }

      // Try to load trading status
      try {
        const tradingStatus = await activeContract.isTradingDisabled();
        setIsTradingDisabled(tradingStatus);
      } catch (error) {
        console.log('Could not fetch trading status:', error);
      }

      // Try to load expected delivery time
      try {
        const deliveryTime = await activeContract.getExpectedDeliveryTime();
        setExpectedDeliverySeconds(deliveryTime.toString());
        
        // Convert seconds to days and hours
        const { days, hours } = convertSecondsToDaysAndHours(deliveryTime);
        setExpectedDeliveryDays(days);
        setExpectedDeliveryHours(hours);
      } catch (error) {
        console.log('Could not fetch delivery time:', error);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsError(true);
      setErrorMessage('Failed to load current settings');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    return ethers.isAddress(address);
  };

  // Toggle whitelist status
  const toggleWhitelist = async (): Promise<void> => {
    setIsProcessing(true);
    setProcessingMessage(`${isWhitelistEnabled ? 'Disabling' : 'Enabling'} whitelist...`);
    setIsError(false);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!activeContract || !signer) {
        throw new Error('Contract or signer not available');
      }
      
      // Connect contract with signer
      const contractWithSigner = activeContract.connect(signer);
      
      // Call the appropriate function based on the desired state
      // Commented out for now - uncomment and adjust based on your actual contract
      /*
      if (isWhitelistEnabled) {
        const tx = await contractWithSigner.disableWhitelist();
        await tx.wait();
      } else {
        const tx = await contractWithSigner.enableWhitelist();
        await tx.wait();
      }
      */
      
      // For now, just toggle the state without blockchain interaction
      setIsWhitelistEnabled(!isWhitelistEnabled);
      setSuccessMessage(`Whitelist ${isWhitelistEnabled ? 'disabled' : 'enabled'} successfully`);
      
      // Notify parent component
      onUpdateSuccess('whitelistToggle');
    } catch (error) {
      console.error('Error toggling whitelist:', error);
      setIsError(true);
      setErrorMessage(`Failed to ${isWhitelistEnabled ? 'disable' : 'enable'} whitelist`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Add address to whitelist
  const addToWhitelist = async (): Promise<void> => {
    if (!isValidAddress(whitelistAddress)) {
      setIsError(true);
      setErrorMessage('Invalid Ethereum address');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Adding address to whitelist...');
    setIsError(false);
    setErrorMessage('');

    try {
      if (!activeContract || !signer) {
        throw new Error('Contract or signer not available');
      }
      
      // Connect contract with signer
      const contractWithSigner = activeContract.connect(signer);
      
      // Call the addToWhitelist function (adjust based on your actual contract)
      //const tx = await contractWithSigner.addToWhitelist(whitelistAddress);
     // await tx.wait();
      
      // Update local state
      setWhitelistedAddresses([...whitelistedAddresses, whitelistAddress]);
      setWhitelistAddress(''); // Clear input
      setSuccessMessage('Address added to whitelist successfully');
      
      // Notify parent component
      onUpdateSuccess('whitelist');
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      setIsError(true);
      setErrorMessage('Failed to add address to whitelist');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Request to disable trading
  const requestDisableTrading = async (): Promise<void> => {
    setIsProcessing(true);
    setProcessingMessage('Requesting to disable trading...');
    setIsError(false);
    setErrorMessage('');

    try {
      if (!activeContract || !signer) {
        throw new Error('Contract or signer not available');
      }
      
      // Connect contract with signer
      const contractWithSigner = activeContract.connect(signer);
      
      // Call the requestDisableTrading function (adjust based on your actual contract)
      //const tx = await contractWithSigner.requestDisableTrading();
      //await tx.wait();
      
      setSuccessMessage('Trading disable request submitted. Awaiting admin approval.');
      
      // Notify parent component
      onUpdateSuccess('trading');
    } catch (error) {
      console.error('Error requesting disable trading:', error);
      setIsError(true);
      setErrorMessage('Failed to request disabling trading');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Set expected delivery time
  const setDeliveryTime = async (): Promise<void> => {
    if (!expectedDeliverySeconds || parseInt(expectedDeliverySeconds) <= 0) {
      setIsError(true);
      setErrorMessage('Please enter a valid delivery time');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Setting expected delivery time...');
    setIsError(false);
    setErrorMessage('');

    try {
      if (!activeContract || !signer) {
        throw new Error('Contract or signer not available');
      }
      
      // Connect contract with signer
      const contractWithSigner = activeContract.connect(signer);
      
      // Call the setExpectedDeliveryTime function (adjust based on your actual contract)
      //const tx = await contractWithSigner.setExpectedDeliveryTime(expectedDeliverySeconds);
      //await tx.wait();
      
      setSuccessMessage('Expected delivery time set successfully');
      
      // Notify parent component
      onUpdateSuccess('deliveryTime');
    } catch (error) {
      console.error('Error setting delivery time:', error);
      setIsError(true);
      setErrorMessage('Failed to set expected delivery time');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Handle input change for days and hours
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setExpectedDeliveryDays(value === '' ? 0 : parseInt(value));
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 24)) {
      setExpectedDeliveryHours(value === '' ? 0 : parseInt(value));
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-violet-800">Edit Launch Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-blue-700">{processingMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Whitelist Toggle Section */}
        <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-indigo-800">Whitelist Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                {isWhitelistEnabled 
                  ? "Only whitelisted addresses can purchase items" 
                  : "Anyone can purchase items"}
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-3">
                {isWhitelistEnabled ? "Enabled" : "Disabled"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isWhitelistEnabled}
                  onChange={() => setIsWhitelistEnabled(!isWhitelistEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
          
          <button
            onClick={toggleWhitelist}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWhitelistEnabled ? "Disable Whitelist" : "Enable Whitelist"}
          </button>
        </div>

        {/* Whitelist Section */}
        <div className={`mb-8 p-6 bg-violet-50 rounded-xl border border-violet-100 ${!isWhitelistEnabled ? 'opacity-50' : ''}`}>
          <h3 className="text-lg font-semibold text-violet-800 mb-4">Whitelist Management</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter Ethereum address"
              value={whitelistAddress}
              onChange={(e) => setWhitelistAddress(e.target.value)}
              className="flex-grow p-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={!isWhitelistEnabled}
            />
            <button
              onClick={addToWhitelist}
              disabled={isProcessing || !whitelistAddress || !isWhitelistEnabled}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Whitelisted Addresses List */}
          <div className="max-h-48 overflow-y-auto bg-white rounded-xl p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Whitelisted Addresses</h4>
            {whitelistedAddresses.length > 0 ? (
              <ul className="space-y-2">
                {whitelistedAddresses.map((address, index) => (
                  <li key={index} className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded-lg flex items-center justify-between">
                    <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Whitelisted</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                {isWhitelistEnabled 
                  ? "No addresses whitelisted yet" 
                  : "Whitelist is currently disabled"}
              </p>
            )}
          </div>
        </div>

        {/* Trading Status Section */}
        <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Trading Status</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-700">Disable Trading</p>
              <p className="text-sm text-gray-500">Current status: {isTradingDisabled ? "Disabled" : "Enabled"}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isTradingDisabled}
                onChange={() => setIsTradingDisabled(!isTradingDisabled)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
          
          {/* Admin notice */}
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-start">
              <div className="mr-3 mt-1 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Requires Protocol Admin Approval</p>
                <p className="text-xs text-gray-600 mt-1">
                  Disabling trading requires approval from protocol admins. 
                  Your request will be submitted and processed accordingly.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={requestDisableTrading}
            disabled={isProcessing || !isTradingDisabled}
            className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Trading Status Change
          </button>
        </div>

        {/* Expected Delivery Section */}
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Expected Delivery after Redemption</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
              <input
                type="text"
                placeholder="Days"
                value={expectedDeliveryDays}
                onChange={handleDaysChange}
                className="w-full p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="text"
                placeholder="Hours (0-23)"
                value={expectedDeliveryHours}
                onChange={handleHoursChange}
                className="w-full p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              Total seconds: <span className="font-mono font-medium">{expectedDeliverySeconds}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This is the time users can expect to receive physical items after redemption period.
            </p>
          </div>
          
          <button
            onClick={setDeliveryTime}
            disabled={isProcessing || !expectedDeliverySeconds}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Expected Delivery Time
          </button>
        </div>

        {/* Save/Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLaunch;