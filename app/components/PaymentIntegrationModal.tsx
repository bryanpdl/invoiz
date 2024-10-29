import React, { useState, useEffect, useCallback } from 'react';
import { FaStripe, FaPaypal, FaCheck } from 'react-icons/fa';
import { connectStripe, connectPayPal, disconnectPaymentProvider, getConnectedPaymentProvider } from '../utils/paymentProviders';
import { useAuth } from '../hooks/useAuth';

interface PaymentIntegrationModalProps {
  onClose: () => void;
  onUpdate: (provider: { provider: string; accountId: string } | null) => void;
}

export default function PaymentIntegrationModal({ onClose, onUpdate }: PaymentIntegrationModalProps) {
  const { user } = useAuth();
  const [connectedProvider, setConnectedProvider] = useState<{ provider: string; accountId: string } | null>(null);
  const [showPayPalInput, setShowPayPalInput] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');

  const handleStripeConnect = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      await connectStripe(user.uid);
      const newProvider = { provider: 'Stripe', accountId: 'Connected' };
      setConnectedProvider(newProvider);
      onUpdate(newProvider);
    } catch (error) {
      console.error('Error connecting Stripe:', error);
    }
  }, [user, onUpdate]);

  const handlePayPalConnect = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!paypalEmail || !user) return;
    try {
      await connectPayPal(user.uid, paypalEmail);
      const newProvider = { provider: 'PayPal', accountId: paypalEmail };
      setConnectedProvider(newProvider);
      onUpdate(newProvider);
      setShowPayPalInput(false);
    } catch (error) {
      console.error('Error connecting PayPal:', error);
    }
  }, [user, paypalEmail, onUpdate]);

  const handleDisconnect = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      await disconnectPaymentProvider(user.uid);
      setConnectedProvider(null);
      onUpdate(null);
      onClose();
    } catch (error) {
      console.error('Error disconnecting provider:', error);
    }
  }, [user, onUpdate, onClose]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-8 rounded-lg shadow-lg"
        onClick={handleModalClick}
      >
        <h2 className="text-2xl font-bold mb-4">Connect Payment Provider</h2>
        {connectedProvider ? (
          <div className="mb-4">
            <p>Connected to {connectedProvider.provider} ✓</p>
            <p className="text-sm text-gray-500">{connectedProvider.accountId}</p>
            <button
              onClick={handleDisconnect}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={handleStripeConnect}
                className="flex items-center justify-center w-full px-4 py-2 bg-[#1F1F1F] text-white rounded-md hover:bg-[#404040] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <FaStripe className="mr-2" />
                Connect Stripe
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowPayPalInput(!showPayPalInput)}
                className="flex items-center justify-center w-full px-4 py-2 bg-[#2E647D] text-white rounded-md hover:bg-[#4290B2] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              >
                <FaPaypal className="mr-2" />
                Connect PayPal
              </button>
              {showPayPalInput && (
                <div className="mt-2 flex items-center">
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="Your PayPal Email"
                    className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={handlePayPalConnect}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                  >
                    <FaCheck />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onClose(); }}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
