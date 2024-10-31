'use client';

import Link from "next/link";
import { useAuth } from './hooks/useAuth';
import { FaFileInvoiceDollar, FaCreditCard, FaChartLine, FaLock, FaRegClock, FaPalette } from 'react-icons/fa';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Hero Section - Updated styling */}
      <header className="w-full py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">
            Professional Invoicing<br />Made Simple
          </h1>
          <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
            Create, manage, and track invoices with ease. Get paid faster with our modern invoicing platform.
          </p>
          <div className="flex gap-4 justify-center">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-12 w-32 rounded-xl"></div>
            ) : user ? (
              <Link 
                href="/dashboard" 
                className="bg-[#273E4E] hover:bg-[#1F3240] text-white font-medium py-3 px-8 rounded-xl transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="bg-[#273E4E] hover:bg-[#1F3240] text-white font-medium py-3 px-8 rounded-xl transition-colors duration-200"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-8 rounded-xl border border-gray-200 transition-colors duration-200"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section - Updated styling */}
      <section className="py-24 px-4 w-full bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Everything you need to manage invoices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaFileInvoiceDollar size={24} />,
                title: "Easy Invoice Creation",
                description: "Create professional invoices in minutes with our intuitive interface and customizable templates."
              },
              {
                icon: <FaCreditCard size={24} />,
                title: "Secure Payments",
                description: "Accept payments online with integrated Stripe and PayPal support, all with bank-level security."
              },
              {
                icon: <FaChartLine size={24} />,
                title: "Analytics & Tracking",
                description: "Monitor your business performance with real-time analytics and payment tracking features."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200"
              >
                <div className="text-[#273E4E] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Updated styling */}
      <section className="py-24 px-4 w-full bg-white">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Simple, transparent pricing</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              description: "Perfect for individuals and small businesses",
              price: "0",
              features: [
                "Up to 5 invoices per month",
                "Basic templates",
                "Email support",
                "Basic analytics"
              ]
            },
            {
              name: "Pro",
              description: "For growing businesses",
              price: "19.99",
              popular: true,
              features: [
                "Unlimited invoices",
                "Premium templates",
                "Priority support",
                "Advanced analytics",
                "Custom branding",
                "API access"
              ]
            }
          ].map((plan, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-xl ${
                plan.popular 
                  ? 'shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-2 border-[#273E4E] relative' 
                  : 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              } flex-1 max-w-md`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#273E4E] text-white px-4 py-1 rounded-full text-sm">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
              <p className="text-3xl font-bold mb-6 text-gray-900">
                ${plan.price}<span className="text-lg text-gray-500">/month</span>
              </p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/signup" 
                className={`block text-center py-2 px-4 rounded-xl transition-colors duration-200 ${
                  plan.popular
                    ? 'bg-[#273E4E] hover:bg-[#1F3240] text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="w-full py-8 px-4 text-center text-gray-500 bg-white border-t border-gray-100">
        <p className="text-sm">&copy; 2024 Invoiz. All rights reserved.</p>
      </footer>
    </div>
  );
}
