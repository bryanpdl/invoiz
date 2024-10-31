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
import QuickMenu from '../components/QuickMenu';
import InvoiceControls from '../components/InvoiceControls';
import ClientPanel from '../components/ClientPanel';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });
  const [activeSection, setActiveSection] = useState<'invoices' | 'clients'>('invoices');

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

  useEffect(() => {
    applyFilters();
  }, [invoices, searchQuery, statusFilter, dateRange, sortConfig]);

  const applyFilters = () => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => 
        statusFilter === 'paid' ? invoice.paid : !invoice.paid
      );
    }

    // Apply date filter with proper null checking and type narrowing
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.date).getTime();
        const startTime = dateRange.start.getTime();
        const endTime = dateRange.end.getTime();
        
        return invoiceDate >= startTime && invoiceDate <= endTime;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof Invoice];
      const bValue = b[sortConfig.field as keyof Invoice];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredInvoices(filtered);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <nav className="border-b border-gray-100 px-8 py-4 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setActiveSection('invoices')}
              className={`text-xl font-semibold ${
                activeSection === 'invoices' 
                  ? 'text-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              My Invoices
            </button>
            <button
              onClick={() => setActiveSection('clients')}
              className={`text-xl font-semibold ${
                activeSection === 'clients' 
                  ? 'text-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Clients
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                id="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="focus:outline-none"
              >
                <UserAvatar />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FaCog className="mr-3 text-gray-400" />
                    Settings
                  </Link>

                  <Link
                    href="/billing"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FaMoneyBillWave className="mr-3 text-gray-400" />
                    Billing & Plan
                  </Link>

                  <Link
                    href="/payment-methods"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FaCreditCard className="mr-3 text-gray-400" />
                    Payment Methods
                  </Link>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

        <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
          {activeSection === 'invoices' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-center mb-2">
                    <FaFileInvoice className="text-blue-500 mr-2" />
                    <h3 className="font-medium text-gray-600">Total Invoices</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{invoices.length}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-center mb-2">
                    <FaMoneyBillWave className="text-green-500 mr-2" />
                    <h3 className="font-medium text-gray-600">Total Revenue</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">${getTotalRevenue()}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-purple-500 mr-2" />
                    <h3 className="font-medium text-gray-600">Pending Invoices</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{getPendingInvoices()}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-center mb-2">
                    <FaClock className="text-orange-500 mr-2" />
                    <h3 className="font-medium text-gray-600">Active Reminders</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>

              <InvoiceControls
                onSearch={(query) => setSearchQuery(query)}
                onFilterStatus={(status) => setStatusFilter(status)}
                onFilterDate={(start, end) => setDateRange({ start, end })}
                onSort={(field, direction) => setSortConfig({ field, direction })}
              />

              <div className="mb-6">
                <div className="border-b border-gray-100">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className={`${
                        activeTab === 'invoices'
                          ? 'border-gray-800 text-gray-800'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Invoices
                    </button>
                    <button
                      onClick={() => setActiveTab('reminders')}
                      className={`${
                        activeTab === 'reminders'
                          ? 'border-gray-800 text-gray-800'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Payment Reminders
                    </button>
                  </nav>
                </div>
              </div>

              {activeTab === 'invoices' ? (
                loading ? (
                  <p className="text-gray-500">Loading invoices...</p>
                ) : filteredInvoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInvoices.map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                              <p className="text-gray-500 text-sm">Client: {invoice.clientName}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              invoice.paid 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {invoice.paid ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-500">
                            <p>Date: {invoice.date}</p>
                            <p>Due: {invoice.dueDate}</p>
                            <p className="text-gray-900 font-medium">${(invoice.total || 0).toFixed(2)}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                            <Link 
                              href={`/edit-invoice/${invoice.id}`} 
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium rounded-lg px-3 py-1 hover:bg-gray-50 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id!)}
                              className="text-gray-400 hover:text-red-600 text-sm font-medium rounded-lg px-3 py-1 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
                    <p className="text-gray-500 mb-4">No invoices found. Create your first invoice!</p>
                    <Link href="/create-invoice" className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                      <FaFileInvoice className="mr-2" />
                      Create New Invoice
                    </Link>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
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
            </>
          ) : (
            <ClientPanel invoices={invoices} />
          )}
        </div>

        <QuickMenu />
      </div>
    </ProtectedRoute>
  );
}