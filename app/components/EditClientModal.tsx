'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Client } from '../types/client';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onClientUpdated: (client: Client) => void;
}

export default function EditClientModal({ client, onClose, onClientUpdated }: EditClientModalProps) {
  const [clientData, setClientData] = useState<Partial<Client>>({
    company: client.company,
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    notes: client.notes || '',
    customPaymentTerms: {
      preferredPaymentMethod: client.customPaymentTerms?.preferredPaymentMethod || '',
      bankDetails: client.customPaymentTerms?.bankDetails,
      paypalEmail: client.customPaymentTerms?.paypalEmail,
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const clientRef = doc(db, 'clients', client.id);
      const updatedClient = {
        ...client,
        ...clientData,
        customPaymentTerms: {
          ...client.customPaymentTerms,
          ...clientData.customPaymentTerms,
        }
      };

      await updateDoc(clientRef, updatedClient);
      onClientUpdated(updatedClient);
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" style={{ margin: 0 }}>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md m-4">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                value={clientData.company}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="name"
                value={clientData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={clientData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={clientData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Payment Method
              </label>
              <select
                name="preferredPaymentMethod"
                value={clientData.customPaymentTerms?.preferredPaymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a method</option>
                <option value="creditCard">Credit Card</option>
                <option value="bankTransfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={clientData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#273E4E] text-white rounded-xl hover:bg-[#1F3240] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 