'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { Client } from '../types/client';
import { FaTimes } from 'react-icons/fa';

interface AddClientModalProps {
  onClose: () => void;
  onClientAdded: (newClient: Client) => void;
}

export default function AddClientModal({ onClose, onClientAdded }: AddClientModalProps) {
  const { user } = useAuth();
  const [clientData, setClientData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    preferredPaymentMethod: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Add client to Firestore
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        userId: user.uid,
        createdAt: new Date(),
        totalSpent: 0,
        lastPayment: null,
        paymentRegularity: 'regular'
      });

      const newClient: Client = {
        id: docRef.id,
        userId: user.uid,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        company: clientData.company,
        notes: clientData.notes,
        totalSpent: 0,
        lastPayment: undefined,
        paymentRegularity: 'regular',
        customPaymentTerms: {
          preferredPaymentMethod: clientData.preferredPaymentMethod || undefined
        }
      };

      onClientAdded(newClient);
    } catch (err) {
      setError('Failed to add client');
      console.error('Error adding client:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" style={{ margin: 0 }}>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md m-4">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter company name"
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
                  placeholder="Optional contact name"
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
                  value={clientData.preferredPaymentMethod}
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
                  className="px-4 py-2 bg-[#273E4E] text-white rounded-lg hover:bg-[#1F3240] transition-colors"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}