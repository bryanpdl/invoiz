'use client';

import Link from "next/link";
import { useAuth } from './hooks/useAuth';
import { FaFileInvoiceDollar, FaCreditCard, FaChartLine, FaLock, FaRegClock, FaPalette } from 'react-icons/fa';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Hero Section */}
      <header className="text-center py-20 px-4 bg-gradient-to-b from-white to-gray-50 w-full">
        <h1 className="text-5xl font-bold mb-4">Welcome to Invoiz</h1>
        <p className="text-2xl mb-8 text-gray-600">Create professional invoices with ease</p>
        <div className="flex gap-4 justify-center">
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                Sign Up
              </Link>
              <Link href="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors">
                Log In
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4 w-full bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaFileInvoiceDollar size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Invoice Creation</h3>
              <p className="text-gray-600">Create professional invoices in minutes with our intuitive interface and customizable templates.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaCreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Accept payments online with integrated Stripe and PayPal support, all with bank-level security.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaChartLine size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Track payments, monitor cash flow, and gain insights with detailed financial reports.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaPalette size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Customizable Templates</h3>
              <p className="text-gray-600">Choose from a variety of professional templates and customize them to match your brand.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaRegClock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Reminders</h3>
              <p className="text-gray-600">Set up automatic payment reminders and late payment notifications to improve cash flow.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4">
                <FaLock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Storage</h3>
              <p className="text-gray-600">All your invoices are securely stored in the cloud, accessible anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 w-full bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg flex-1 max-w-md">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-600 mb-4">Perfect for individuals and small businesses</p>
            <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
            <ul className="mb-8 space-y-2">
              <li>✓ Up to 5 invoices per month</li>
              <li>✓ Basic templates</li>
              <li>✓ Email support</li>
              <li>✓ Basic analytics</li>
            </ul>
            <Link href="/signup" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg flex-1 max-w-md border-2 border-blue-500">
            <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mb-4">MOST POPULAR</div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-600 mb-4">For growing businesses</p>
            <p className="text-4xl font-bold mb-6">$19.99<span className="text-lg text-gray-600">/month</span></p>
            <ul className="mb-8 space-y-2">
              <li>✓ Unlimited invoices</li>
              <li>✓ Premium templates</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom branding</li>
              <li>✓ API access</li>
            </ul>
            <Link href="/signup" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 text-center text-gray-500 bg-white">
        <p>&copy; 2024 Invoiz. All rights reserved.</p>
      </footer>
    </div>
  );
}
