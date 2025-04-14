"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Interface for Shipping Details
interface ShippingDetails {
    recipientName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber?: string;
    email?: string;
}

// Interface for NFT Metadata
interface NFTMetadata {
    name: string;
    description: string;
    itemPhoto: string;
    condition: string;
    shipping: string;
    store: string;
    category: string;
    size: string;
    owner: string;
    redeemValue: number;
}

// Interface for the Order
interface Order {
    collection: string;
    tokenId: bigint;
    exists: boolean;
    orderType: bigint;
    status?: string;
    isCompleted?: boolean;
    isPending?: boolean;
    shippingDetails?: ShippingDetails;
    metadata?: NFTMetadata;
    withdrawableBalance?: string;
    isDigitalItem?: boolean;
    trackingNumber?: string;
    timestamp?: number;
    customer?: string;
    store?: string;
}

// Props interface for the component
interface OrderInspectionProps {
    order: Order;
    onClose: () => void;
    onFulfill: (trackingNumber: string, email?: string, walletAddress?: string) => void;
}

const OrderInspection: React.FC<OrderInspectionProps> = ({ order, onClose, onFulfill }) => {
    // State for form fields
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
    const [email, setEmail] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    
    // Add fallback URL for image errors
    const [imgError, setImgError] = useState(false);
    const handleImgError = () => setImgError(true);
    
    // Initialize with tracking number if available
    useEffect(() => {
        if (order.trackingNumber) {
            setTrackingNumber(order.trackingNumber);
        }
    }, [order.trackingNumber]);
    
    // Determine if this is a physical or digital item (based on order type or metadata)
    // Add null check to avoid "Cannot read properties of undefined (reading 'toString')" error
    const isDigitalItem = order.isDigitalItem || (order.orderType && order.orderType.toString() === "2");

    // Format the withdrawable balance with null check
    const formattedBalance = order.withdrawableBalance || "0.00";
    
    // Format timestamp to readable date
    const formatTimestamp = (timestamp:any) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    // Handle order fulfillment
    const handleFulfill = () => {
        if (isDigitalItem && !email && !walletAddress) {
            setMessage('Please enter an email or wallet address');
            return;
        }
        
        if (!isDigitalItem && !trackingNumber) {
            setMessage('Please enter a tracking number');
            return;
        }
        
        setIsProcessing(true);
        setMessage('Processing...');
        
        // Call the parent's onFulfill function
        onFulfill(trackingNumber, email, walletAddress);
    };

    // Handle withdrawal of funds
    const handleWithdraw = () => {
        setIsProcessing(true);
        setMessage('Processing withdrawal...');
        
        // Simulate withdrawal process
        setTimeout(() => {
            setMessage('Funds withdrawn successfully!');
            setTimeout(() => {
                setIsProcessing(false);
                onClose();
            }, 1500);
        }, 1500);
    };

    // Get status badge color based on status
    const getStatusBadgeClass = () => {
        switch(order.status) {
            case "Pending":
                return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
            case "Processing":
                return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
            case "Shipped":
                return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
            case "Completed":
                return "bg-green-500/20 text-green-300 border border-green-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-4xl w-full mx-4 h-4/5 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 py-4 z-10">
                    <h3 className="text-2xl font-bold text-white">Order Inspection</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Order Balance Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg mb-8 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg text-white font-medium">Withdrawable Balance</h4>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                            {parseFloat(formattedBalance) > 0 ? 'Available' : 'Pending'}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        {formattedBalance} ETH
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                        Available after order completion
                    </p>
                    <button
                        onClick={handleWithdraw}
                        disabled={Boolean(parseFloat(formattedBalance) <= 0 || isProcessing)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                            parseFloat(formattedBalance) <= 0 || isProcessing
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                        } text-white`}
                    >
                        Withdraw Funds
                    </button>
                </div>
                
                {/* Order Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Basic Order Details */}
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-white pb-2 border-b border-gray-700">Order Information</h4>
                        
                        <div>
                            <h5 className="text-gray-400 text-sm mb-1">Collection</h5>
                            <p className="text-gray-300 font-mono text-xs break-all">{order.collection}</p>
                        </div>
                        
                        <div>
                            <h5 className="text-gray-400 text-sm mb-1">Token ID</h5>
                            <p className="text-white font-medium">#{order.tokenId?.toString()}</p>
                        </div>
                        
                        <div>
                            <h5 className="text-gray-400 text-sm mb-1">Order Type</h5>
                            <p className="text-white font-medium">
                                {order.orderType && order.orderType.toString() === "1" ? "Physical Item" : "Digital Item"}
                            </p>
                        </div>
                        
                        <div>
                            <h5 className="text-gray-400 text-sm mb-1">Status</h5>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass()}`}>
                                {order.status || "Pending"}
                            </span>
                        </div>
                        
                        {order.timestamp && (
                            <div>
                                <h5 className="text-gray-400 text-sm mb-1">Order Date</h5>
                                <p className="text-white">{formatTimestamp(order.timestamp)}</p>
                            </div>
                        )}
                        
                        {order.trackingNumber && (
                            <div>
                                <h5 className="text-gray-400 text-sm mb-1">Tracking Number</h5>
                                <p className="text-white">{order.trackingNumber}</p>
                            </div>
                        )}
                        
                        {/* Additional order metadata if available */}
                        {order.metadata && (
                            <>
                                <div>
                                    <h5 className="text-gray-400 text-sm mb-1">Item Name</h5>
                                    <p className="text-white">{order.metadata.name}</p>
                                </div>
      
                                <div>
                                    <h5 className="text-gray-400 text-sm mb-1">Condition</h5>
                                    <p className="text-white">{order.metadata.condition}</p>
                                </div>
                                
                                <div>
                                    <h5 className="text-gray-400 text-sm mb-1">Category</h5>
                                    <p className="text-white">{order.metadata.category}</p>
                                </div>
                                
                                {order.metadata.size && (
                                    <div>
                                        <h5 className="text-gray-400 text-sm mb-1">Size</h5>
                                        <p className="text-white">{order.metadata.size}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Right Column - Shipping Details or Item Preview */}
                    <div className="space-y-6">
                        {order.metadata?.itemPhoto ? (
                            <div className="mb-6">
                                <h4 className="text-xl font-bold text-white pb-2 border-b border-gray-700 mb-4">Item Preview</h4>
                                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-800">
                                    {/* Use regular img tag instead of Next.js Image */}
                                    <img 
                                        src={imgError ? "/api/placeholder/400/400" : order.metadata.itemPhoto} 
                                        alt={order.metadata.name || 'Item preview'} 
                                        className="w-full h-full object-contain"
                                        onError={handleImgError}
                                    />
                                </div>
                                {order.metadata.description && (
                                    <div className="mt-4">
                                        <h5 className="text-gray-400 text-sm mb-1">Description</h5>
                                        <p className="text-gray-300 text-sm">{order.metadata.description}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h4 className="text-xl font-bold text-white pb-2 border-b border-gray-700">Preview Unavailable</h4>
                                <p className="text-gray-400 mt-4">Item image not provided</p>
                            </div>
                        )}
                        
                        {/* Shipping details if available */}
                        {order.shippingDetails && (
                            <div>
                                <h4 className="text-xl font-bold text-white pb-2 border-b border-gray-700 mb-4">Shipping Information</h4>
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                                    <div>
                                        <h5 className="text-gray-400 text-xs">Recipient</h5>
                                        <p className="text-white font-medium">{order.shippingDetails.recipientName}</p>
                                    </div>
                                    <div>
                                        <h5 className="text-gray-400 text-xs">Address</h5>
                                        <p className="text-white">{order.shippingDetails.streetAddress}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <h5 className="text-gray-400 text-xs">City</h5>
                                            <p className="text-white">{order.shippingDetails.city}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-gray-400 text-xs">State</h5>
                                            <p className="text-white">{order.shippingDetails.state}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <h5 className="text-gray-400 text-xs">Zip Code</h5>
                                            <p className="text-white">{order.shippingDetails.zipCode}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-gray-400 text-xs">Country</h5>
                                            <p className="text-white">{order.shippingDetails.country}</p>
                                        </div>
                                    </div>
                                    {order.shippingDetails.phoneNumber && (
                                        <div>
                                            <h5 className="text-gray-400 text-xs">Phone</h5>
                                            <p className="text-white">{order.shippingDetails.phoneNumber}</p>
                                        </div>
                                    )}
                                    {order.shippingDetails.email && (
                                        <div>
                                            <h5 className="text-gray-400 text-xs">Email</h5>
                                            <p className="text-white">{order.shippingDetails.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Order Fulfillment Section - Only show if pending or processing */}
                {(order.status === 'Pending' || order.status === 'Processing') && (
                    <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700 mb-6">
                        <h4 className="text-xl font-bold text-white mb-6">Fulfill Order</h4>
                        
                        {/* Different form fields based on order type */}
                        {isDigitalItem ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter recipient's email"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Wallet Address <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="Enter wallet address for digital delivery"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter shipping tracking number"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        )}
                        
                        {message && (
                            <div className={`mt-4 p-3 rounded-lg ${
                                message.includes('success') 
                                    ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                                    : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                            }`}>
                                {message}
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <button
                                onClick={handleFulfill}
                                disabled={Boolean(isProcessing || (!trackingNumber && !isDigitalItem) || (isDigitalItem && !email && !walletAddress))}
                                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                                    isProcessing || (!trackingNumber && !isDigitalItem) || (isDigitalItem && !email && !walletAddress)
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                                } text-white`}
                            >
                                {isProcessing ? 'Processing...' : 'Complete Fulfillment'}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Order Complete Message - Only show if completed */}
                {order.status === 'Completed' && (
                    <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30 mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-green-300">Order Completed</h4>
                        </div>
                        <p className="text-gray-300">This order has been fulfilled and completed. No further action is required.</p>
                    </div>
                )}
                
                {/* Shipped Message - Only show if shipped */}
                {order.status === 'Shipped' && (
                    <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/30 mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-purple-300">Order Shipped</h4>
                        </div>
                        <p className="text-gray-300">This order has been shipped. Use the tracking number to check delivery status.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderInspection;