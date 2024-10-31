'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, 
  FaFileInvoice, 
  FaUserPlus, 
  FaLink,
  FaTimes
} from 'react-icons/fa';

export default function QuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: <FaFileInvoice />,
      label: 'New Invoice',
      action: () => router.push('/create-invoice'),
      color: 'bg-blue-500'
    },
    {
      icon: <FaUserPlus />,
      label: 'New Client',
      action: () => router.push('/clients/new'),
      color: 'bg-green-500'
    },
    {
      icon: <FaLink />,
      label: 'Payment Link',
      action: () => router.push('/payment-link/new'),
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-4 space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-end space-x-2 transition-all duration-200"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                opacity: isOpen ? 1 : 0,
                transform: `translateY(${isOpen ? 0 : 20}px)`
              }}
            >
              {/* Tooltip */}
              {hoveredItem === index && (
                <span className="bg-white px-3 py-2 rounded-lg shadow-lg text-gray-700 text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
              <button
                onClick={item.action}
                className={`${item.color} p-3 rounded-full text-white shadow-lg hover:opacity-90 transition-opacity`}
              >
                {item.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`p-4 rounded-full shadow-lg text-white transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-500'
        }`}
      >
        <FaPlus size={24} />
      </button>
    </div>
  );
}