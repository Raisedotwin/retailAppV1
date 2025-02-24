import React, { useState } from 'react';

interface ShippingDetails {
  recipientName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
}

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shippingDetails: ShippingDetails, isExpedited: boolean) => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    recipientName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: '',
    email: ''
  });
  const [isExpedited, setIsExpedited] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(shippingDetails, isExpedited);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shipping Information</h2>
          <p className="text-gray-600 mt-2">Please enter your shipping details to complete your order</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                value={shippingDetails.recipientName}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  recipientName: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={shippingDetails.email}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  email: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={shippingDetails.streetAddress}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  streetAddress: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={shippingDetails.city}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  city: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={shippingDetails.state}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  state: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={shippingDetails.zipCode}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  zipCode: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={shippingDetails.country}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  country: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={shippingDetails.phoneNumber}
                onChange={(e) => setShippingDetails({
                  ...shippingDetails,
                  phoneNumber: e.target.value
                })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              id="expedited"
              checked={isExpedited}
              onChange={(e) => setIsExpedited(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="expedited" className="text-sm font-medium text-gray-700">
              Expedited Shipping
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal;