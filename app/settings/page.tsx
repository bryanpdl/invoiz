'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import { FaUser, FaFileInvoice, FaEnvelope, FaEye, FaEyeSlash, FaCreditCard, FaImage, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'invoice'>('account');
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: false,
    acceptCreditCards: false,
    acceptBankTransfers: false,
    businessName: ''
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    // Here you would typically save the settings to your database
    // For now, we'll just redirect
    router.push('/dashboard');
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Here you would typically:
    // 1. Upload the file to your storage (e.g., Firebase Storage)
    // 2. Get the URL
    // 3. Save it to the user's settings
    // For now, we'll just simulate it:
    setTimeout(() => {
      setLogoUrl(URL.createObjectURL(file));
      setUploading(false);
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Add Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Updated Tabs */}
          <div className="mb-8">
            <nav className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center px-6 py-3 text-base font-medium border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'account'
                    ? 'text-[#273E4E] border-[#273E4E]'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="mr-2" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`flex items-center px-6 py-3 text-base font-medium border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'invoice'
                    ? 'text-[#273E4E] border-[#273E4E]'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaFileInvoice className="mr-2" />
                Invoice
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-10">
            {activeTab === 'account' ? (
              <>
                {/* Profile Section */}
                <section>
                  <h2 className="text-base font-semibold text-gray-900">Profile</h2>
                  <div className="mt-6 flex items-center gap-x-6">
                    <img
                      src={user?.photoURL || 'https://via.placeholder.com/100'}
                      alt="Profile"
                      className="h-24 w-24 rounded-full"
                    />
                    <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      Change avatar
                    </button>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred name</label>
                      <input
                        type="text"
                        defaultValue={user?.displayName || ''}
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 outline-none sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </section>

                {/* Security Section */}
                <section className="pt-10 border-t border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Security</h2>
                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                      <input
                        type="password"
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </section>

                {/* Notifications Section */}
                <section className="pt-10 border-t border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-3" />
                        <span className="text-sm text-gray-700">Email Notifications</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={() => handleToggle('emailNotifications')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273E4E]"></div>
                      </label>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                {/* Invoice Defaults */}
                <section>
                  <h2 className="text-base font-semibold text-gray-900">Invoice Defaults</h2>
                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment Terms (Days)</label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                      <input
                        type="number"
                        defaultValue={0}
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </section>

                {/* New Invoice Customization Section */}
                <section className="pt-10 border-t border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Invoice Customization</h2>
                  <p className="mt-1 text-sm text-gray-500">Customize the appearance of your invoices.</p>
                  
                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={settings.businessName}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          businessName: e.target.value
                        }))}
                        placeholder="Enter your business name"
                        className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        This will be automatically filled when creating new invoices
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                      <div className="mt-2 flex items-center gap-x-6">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Company logo"
                            className="h-24 w-auto object-contain rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="h-24 w-40 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                            <FaImage className="text-gray-400 text-xl" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className={`inline-block rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ${
                              uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploading ? 'Uploading...' : logoUrl ? 'Change logo' : 'Upload logo'}
                          </label>
                          {logoUrl && (
                            <button
                              onClick={() => setLogoUrl(null)}
                              className="ml-3 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            Recommended: 300x100 pixels, PNG or JPG
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSave}
              className="rounded-md bg-[#273E4E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1F3240]"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 