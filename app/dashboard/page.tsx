'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInvoices, deleteInvoice } from '../utils/firestore';
import { Invoice } from '../types/invoice';
import { 
  FaChartLine, 
  FaClock, 
  FaFileInvoice, 
  FaMoneyBillWave, 
  FaCog, 
  FaSignOutAlt, 
  FaUser,
  FaCreditCard 
} from 'react-icons/fa';
import Image from 'next/image';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    if (user) {
      try {
        const fetchedInvoices = await getInvoices(user.uid);
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const getTotalRevenue = () => {
    return invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0).toFixed(2);
  };

  const getPendingInvoices = () => {
    return invoices.filter(invoice => !invoice.paid).length;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const avatar = document.getElementById('user-avatar');
      if (
        dropdown && 
        avatar && 
        !dropdown.contains(event.target as Node) && 
        !avatar.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const UserAvatar = () => {
    const photoURL = user?.photoURL;
    
    return photoURL ? (
      <div className="h-10 w-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
        <Image
          src={photoURL}
          alt="User avatar"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
    ) : (
      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
        <FaUser size={20} />
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/create-invoice" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl">
              Create New Invoice
            </Link>
            
            {/* User Avatar Dropdown */}
            <div className="relative flex items-center">
              <button
                id="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="focus:outline-none"
                aria-label="User menu"
              >
                <UserAvatar />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  id="user-dropdown"
                  className="absolute right-0 mt-40 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  {/* User Info */}
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaCog className="mr-3" />
                    Settings
                  </Link>

                  <Link
                    href="/billing"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaMoneyBillWave className="mr-3" />
                    Billing & Plan
                  </Link>

                  <Link
                    href="/payment-methods"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaCreditCard className="mr-3" />
                    Payment Methods
                  </Link>

                  <div className="border-t">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="flex-grow p-8">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FaFileInvoice className="text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-600">Total Invoices</h3>
              </div>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FaMoneyBillWave className="text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-600">Total Revenue</h3>
              </div>
              <p className="text-2xl font-bold">${getTotalRevenue()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FaChartLine className="text-purple-500 mr-2" />
                <h3 className="font-semibold text-gray-600">Pending Invoices</h3>
              </div>
              <p className="text-2xl font-bold">{getPendingInvoices()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FaClock className="text-orange-500 mr-2" />
                <h3 className="font-semibold text-gray-600">Active Reminders</h3>
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`${
                    activeTab === 'invoices'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`${
                    activeTab === 'reminders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
                >
                  Payment Reminders
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'invoices' ? (
            loading ? (
              <p>Loading invoices...</p>
            ) : invoices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{invoice.invoiceNumber}</h3>
                        <p className="text-gray-600">Client: {invoice.clientName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        invoice.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">Date: {invoice.date}</p>
                      <p className="text-gray-600">Due: {invoice.dueDate}</p>
                      <p className="font-bold text-lg">Total: ${(invoice.total || 0).toFixed(2)}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center pt-4 border-t">
                      <Link href={`/edit-invoice/${invoice.id}`} className="text-blue-500 hover:text-blue-600 font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id!)}
                        className="text-red-500 hover:text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No invoices found. Create your first invoice!</p>
                <Link href="/create-invoice" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                  <FaFileInvoice className="mr-2" />
                  Create New Invoice
                </Link>
              </div>
            )
          ) : (
            // Reminders Tab Content
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <FaClock className="mx-auto text-gray-400 text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Automated Payment Reminders</h3>
                <p className="text-gray-600 mb-4">Set up automatic reminders for your pending invoices</p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50" disabled>
                  Configure Reminders (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}