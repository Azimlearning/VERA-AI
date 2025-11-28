// src/components/Header.js
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

/**
 * Header Component with Navigation
 * 
 * Features:
 * - Home button links to landing page (Vera AI Platform)
 * - Vera as main navigation item
 * - AI Agents link to agents overview page
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're in various sections
  const isInVera = pathname?.startsWith('/vera');
  const isInAIAgents = pathname?.startsWith('/agents') ||
                       pathname?.startsWith('/statsx') ||
                       pathname?.startsWith('/meetx');
  
  // Check if we should show VERA logo (About, Vera, AI Agents pages)
  const shouldShowVeraLogo = pathname === '/' || isInVera || isInAIAgents;

  // Navigation items structure - Simplified to only include About, Vera, and AI Agents
  const navItems = [
    { name: 'About', href: '/', type: 'link' },
    { name: 'Vera', href: '/vera', type: 'link' },
    { name: 'AI Agents', href: '/agents', type: 'link' },
  ];

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center h-16 md:h-20 px-4">
        
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          {shouldShowVeraLogo ? (
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              VERA
            </span>
          ) : (
            <Image 
              src="/Systemic-Shifts-Logo/systemic-shifts-logo-BlackWhite.png" 
              alt="Systemic Shifts Logo"
              width={240}
              height={48}
              priority
              className="h-12 w-auto"
            />
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-center items-center gap-1">
          {navItems.map((item) => {
            // Regular link items
            const isActive = pathname === item.href || 
              (item.href === '/' && pathname === '/') ||
              (item.href === '/vera' && isInVera) ||
              (item.href === '/agents' && isInAIAgents);
            return (
              <Link
                key={item.name}
                href={item.href}
                suppressHydrationWarning={true}
                className={`
                  flex items-center justify-center h-full px-3 lg:px-4
                  text-center text-sm font-semibold transition-all duration-200 ease-in-out
                  relative group whitespace-nowrap
                  ${isActive ? 'text-white' : 'text-cyan-200 hover:text-white'}
                `}
              >
                {item.name}
                <span
                  className={`
                    absolute bottom-0 left-0 w-full h-1 bg-cyan-300 rounded-t-full
                    transition-all duration-300 ease-out transform
                    ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `}
                />
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-2xl p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Flyout */}
      <div 
        className={`
          md:hidden fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 z-[100]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-6 pt-20 overflow-y-auto">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-5 right-5 text-white text-3xl p-2"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
          
          {navItems.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className="text-cyan-200 hover:text-white text-2xl font-semibold"
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
