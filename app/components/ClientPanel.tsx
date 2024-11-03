'use client';

import { useEffect, useState } from 'react';
import { Invoice, PaymentTerms } from '../types/invoice';
import { FaStar, FaHistory, FaUserTag, FaAddressCard, FaCog, FaTrash, FaUserPlus } from 'react-icons/fa';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { FaFileInvoice } from 'react-icons/fa';
import AddClientModal from './AddClientModal';
import { Client } from '../types/client';

interface ClientPanelProps {
  invoices: Invoice[];
}

function determinePaymentRegularity(invoices: Invoice[]): 'regular' | 'irregular' {
  if (invoices.length === 0) return 'regular'; // New clients start as regular
  
  const hasOverdueOrUnpaid = invoices.some(invoice => {
    if (!invoice.paid) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today; // Check if unpaid invoice is overdue
    }
    return false;
  });

  return hasOverdueOrUnpaid ? 'irregular' : 'regular';
}

const getPreferredPaymentMethod = (paymentTerms: PaymentTerms): string | null => {
  if (paymentTerms.creditCard?.length > 0) return paymentTerms.creditCard[0];
  if (paymentTerms.bankTransfer) return 'Bank Transfer';
  if (paymentTerms.paypal) return 'PayPal';
  return null;
};

export default function ClientPanel({ invoices }: ClientPanelProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      
      try {
        // First, generate demo clients from invoices
        const demoClientMap = new Map<string, Client>();
        
        invoices.forEach(invoice => {
          if (!demoClientMap.has(invoice.clientEmail)) {
            demoClientMap.set(invoice.clientEmail, {
              id: invoice.clientEmail,
              company: invoice.clientName || 'Unnamed Company',
              name: '',
              email: invoice.clientEmail,
              totalSpent: invoice.total,
              lastPayment: invoice.paid ? invoice.date : '',
              paymentRegularity: invoice.paid ? 'regular' : 'irregular',
              customPaymentTerms: {
                lateFeePercentage: invoice.paymentTerms?.lateFeePercentage || null,
                preferredPaymentMethod: getPreferredPaymentMethod(invoice.paymentTerms)
              }
            });
          } else {
            const existingClient = demoClientMap.get(invoice.clientEmail)!;
            existingClient.totalSpent += invoice.total;
            if (invoice.paid && (!existingClient.lastPayment || new Date(invoice.date) > new Date(existingClient.lastPayment))) {
              existingClient.lastPayment = invoice.date;
            }
          }
        });

        // Then fetch Firestore clients
        const clientsRef = collection(db, 'clients');
        const q = query(clientsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const firestoreClients = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Client[];

        // Merge Firestore clients with demo clients
        firestoreClients.forEach(client => {
          if (demoClientMap.has(client.email)) {
            // Update Firestore client with invoice data
            const demoClient = demoClientMap.get(client.email)!;
            client.totalSpent = demoClient.totalSpent;
            client.lastPayment = demoClient.lastPayment;
            client.paymentRegularity = demoClient.paymentRegularity;
          }
          demoClientMap.set(client.email, client);
        });

        let clientsData = Array.from(demoClientMap.values());

        // Update all clients with latest invoice information
        const updatedClients = clientsData.map(client => {
          const clientInvoices = invoices.filter(inv => inv.clientEmail === client.email);
          const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
          const lastPayment = clientInvoices
            .filter(inv => inv.paid)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || null;

          return {
            ...client,
            totalSpent: totalSpent || client.totalSpent,
            lastPayment: lastPayment || client.lastPayment,
            paymentRegularity: determinePaymentRegularity(clientInvoices)
          };
        });

        setClients(updatedClients.sort((a, b) => b.totalSpent - a.totalSpent));
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user, invoices]);

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    
    try {
      // Only attempt to delete if it's a Firestore client (not a demo client)
      if (clientId.length === 20) { // Firestore IDs are 20 characters
        await deleteDoc(doc(db, 'clients', clientId));
        setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      } else {
        // For demo clients, just remove from state
        setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setDeleteError('Failed to delete client');
      // Clear error after 3 seconds
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {deleteError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          {deleteError}
        </div>
      )}
      
      {loading ? (
        // Loading State
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <div className="space-y-4">
            {/* Stats Cards Loading Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            
            {/* Client Cards Loading Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : clients.length > 0 ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center mb-2">
                <FaStar className="text-yellow-500 mr-2" />
                <h3 className="font-medium text-gray-600">Most Valuable Client</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.length > 0 ? (
                  clients.reduce((prev, current) => 
                    prev.totalSpent > current.totalSpent ? prev : current
                  ).company
                ) : (
                  'No clients yet'
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {clients.length > 0 && `$${clients.reduce((prev, current) => 
                  prev.totalSpent > current.totalSpent ? prev : current
                ).totalSpent.toFixed(2)}`}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center mb-2">
                <FaHistory className="text-blue-500 mr-2" />
                <h3 className="font-medium text-gray-600">Active Clients</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.filter(client => client.lastPayment).length}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center mb-2">
                <FaUserTag className="text-green-500 mr-2" />
                <h3 className="font-medium text-gray-600">Regular Clients</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.filter(client => client.paymentRegularity === 'regular').length}
              </p>
            </div>
          </div>

          {/* Client Cards */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div
                  key={client.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {client.company || 'Unnamed Company'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Contact: {client.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {client.email}
                      </p>
                      {client.phone && (
                        <p className="text-sm text-gray-500">
                          {client.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        client.paymentRegularity === 'regular'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {client.paymentRegularity}
                      </span>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete client"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Total Revenue: ${client.totalSpent.toFixed(2)}</p>
                    <p>Last Payment: {
                      client.lastPayment 
                        ? new Date(client.lastPayment).toLocaleDateString() 
                        : 'No payments yet'
                    }</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Empty State
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserPlus className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Clients Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating an invoice for a client or add them directly to your directory.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/create-invoice"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#273E4E] text-white rounded-lg hover:bg-[#1F3240] transition-colors"
              >
                <FaFileInvoice className="mr-2" />
                Create Invoice
              </Link>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onClientAdded={(newClient: Client) => {
            setClients(prevClients => [...prevClients, newClient].sort((a, b) => b.totalSpent - a.totalSpent));
            setShowAddClientModal(false);
          }}
        />
      )}
    </div>
  );
}