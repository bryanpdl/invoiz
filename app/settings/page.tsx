'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import { FaUser, FaFileInvoice, FaEnvelope, FaEye, FaEyeSlash, FaCreditCard, FaImage, FaArrowLeft, FaPalette } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Add new types for theme options
interface ThemeOption {
  id: string;
  name: string;
  preview: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    preview: '/themes/classic.png', // These images don't exist yet
    description: 'Clean and professional design with traditional layout'
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: '/themes/modern.png',
    description: 'Contemporary design with bold typography'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: '/themes/minimal.png',
    description: 'Sleek and simple design focusing on essential information'
  }
];

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'invoice'>('account');
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: false,
    acceptCreditCards: false,
    acceptBankTransfers: false,
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    autoFillBusiness: {
      name: true,
      address: true,
      phone: true,
    },
    showBusinessName: false,
    showBusinessAddress: false,
    showBusinessPhone: false,
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [logo, setLogo] = useState<string | null>(null);

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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogo(previewUrl);
      
      // TODO: Implement actual file upload to storage
      // uploadLogoToStorage(file).then(url => setLogo(url));
    }
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

                {/* Invoice Customization Section */}
                <section className="pt-10 border-t border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Invoice Customization</h2>
                  <p className="mt-1 text-sm text-gray-500">Customize the appearance of your invoices.</p>
                  
                  <div className="mt-6 space-y-8">
                    {/* Business Information */}
                    <div className="space-y-4">
                      {/* Business Name */}
                      <div className="flex items-start justify-between gap-x-4">
                        <div className="flex-grow">
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
                        </div>
                        <div className="pt-8">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showBusinessName}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                showBusinessName: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273E4E]"></div>
                          </label>
                        </div>
                      </div>

                      {/* Business Address */}
                      <div className="flex items-start justify-between gap-x-4">
                        <div className="flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                          <textarea
                            value={settings.businessAddress}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              businessAddress: e.target.value
                            }))}
                            placeholder="Enter your business address"
                            rows={3}
                            className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                          />
                        </div>
                        <div className="pt-8">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showBusinessAddress}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                showBusinessAddress: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273E4E]"></div>
                          </label>
                        </div>
                      </div>

                      {/* Business Phone */}
                      <div className="flex items-start justify-between gap-x-4">
                        <div className="flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                          <input
                            type="tel"
                            value={settings.businessPhone}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              businessPhone: e.target.value
                            }))}
                            placeholder="Enter your business phone"
                            className="block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
                          />
                        </div>
                        <div className="pt-8">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showBusinessPhone}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                showBusinessPhone: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273E4E]"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Theme Selection */}
                    <div>
                      <div className="flex items-center gap-x-2 mb-4">
                        <FaPalette className="text-gray-400" />
                        <label className="block text-sm font-medium text-gray-700">Invoice Theme</label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {THEME_OPTIONS.map((theme) => (
                          <div
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                              selectedTheme === theme.id
                                ? 'border-[#273E4E] bg-[#273E4E]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3">
                              {/* Theme preview image placeholder */}
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Preview
                              </div>
                            </div>
                            <h3 className="font-medium text-gray-900">{theme.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <div className="flex items-center gap-x-2 mb-4">
                        <FaImage className="text-gray-400" />
                        <label className="block text-sm font-medium text-gray-700">Business Logo</label>
                      </div>
                      <div className="mt-2">
                        {logo ? (
                          <div className="relative w-48 h-48 rounded-lg overflow-hidden group">
                            <img
                              src={logo}
                              alt="Business logo"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => setLogo(null)}
                                className="text-white text-sm hover:underline"
                              >
                                Remove Logo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                            <FaImage className="text-gray-400 text-2xl mb-2" />
                            <span className="text-sm text-gray-500">Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                          Recommended size: 300x100 pixels. Max file size: 2MB.
                        </p>
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