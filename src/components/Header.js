// src/components/Header.js
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

/**
 * Header Component with Dropdown Navigation
 * 
 * Features:
 * - Home button links to landing page (Vera AI Platform)
 * - Vera as main navigation item
 * - AI Agents dropdown with 6 specialized agents
 * - Knowledge Base dropdown with content pages
 * - More dropdown for additional sections
 */
export default function Header() {
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const knowledgeBaseDropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const knowledgeBaseTimeoutRef = useRef(null);
  const moreTimeoutRef = useRef(null);
  const pathname = usePathname();

  // Check if we're in various sections
  const isInVera = pathname?.startsWith('/vera');
  const isInKnowledgeBase = pathname?.startsWith('/knowledge-base') || 
                            pathname?.startsWith('/petronas-2.0') ||
                            pathname?.startsWith('/systemic-shifts') ||
                            pathname?.startsWith('/articles');
  const isInAIAgents = pathname?.startsWith('/agents') ||
                       pathname?.startsWith('/statsx') ||
                       pathname?.startsWith('/meetx') ||
                       pathname?.startsWith('/ulearn/quizzes') ||
                       pathname?.startsWith('/ulearn/podcast') ||
                       pathname?.startsWith('/nexushub/dropbox') ||
                       pathname?.startsWith('/nexushub/upg');
  
  // Check if we should show VERA logo (About, Vera, AI Agents pages)
  const shouldShowVeraLogo = pathname === '/' || isInVera || isInAIAgents;

  // Navigation items structure - New Mega AI Platform Structure
  const navItems = [
    { name: 'About', href: '/', type: 'link' },
    { name: 'Vera', href: '/vera', type: 'link' },
    { name: 'AI Agents', href: '/agents', type: 'link' },
    { 
      name: 'Knowledge Base', 
      href: '/knowledge-base', 
      type: 'dropdown',
      subItems: [
        { name: 'Overview', href: '/knowledge-base' },
        { name: 'PETRONAS 2.0', href: '/petronas-2.0' },
        { 
          name: 'Systemic Shifts', 
          href: '/systemic-shifts/upstream-target',
          subItems: [
            { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
            { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
            { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
            { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
          ]
        },
        { name: 'Articles', href: '/articles' },
        { name: 'UpstreamBuzz', href: '/knowledge-base/upstreambuzz' },
      ]
    },
    { 
      name: 'More', 
      href: '/nexushub', 
      type: 'dropdown',
      subItems: [
        { 
          name: 'NexusHub', 
          href: '/nexushub',
          subItems: [
            { name: 'Overview', href: '/nexushub' },
            { name: 'UpstreamGallery', href: '/nexushub/upg' },
            { name: 'Systemic Shifts Dropbox', href: '/nexushub/dropbox' },
          ]
        },
        { 
          name: 'ULearn', 
          href: '/ulearn',
          subItems: [
            { name: 'Overview', href: '/ulearn' },
            { name: 'Podcast', href: '/ulearn/podcast' },
          ]
        },
      ]
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (knowledgeBaseDropdownRef.current && !knowledgeBaseDropdownRef.current.contains(event.target)) {
        setIsKnowledgeBaseOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    if (isKnowledgeBaseOpen || isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isKnowledgeBaseOpen, isMoreOpen]);

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsKnowledgeBaseOpen(false);
    setIsMoreOpen(false);
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
            if (item.type === 'dropdown') {
              const isKnowledgeBase = item.name === 'Knowledge Base';
              const isMore = item.name === 'More';
              const isOpen = isKnowledgeBase ? isKnowledgeBaseOpen : (isMore ? isMoreOpen : false);
              const setIsOpen = isKnowledgeBase ? setIsKnowledgeBaseOpen : (isMore ? setIsMoreOpen : () => {});
              const dropdownRef = isKnowledgeBase ? knowledgeBaseDropdownRef : (isMore ? moreDropdownRef : null);
              const isInSection = isKnowledgeBase ? isInKnowledgeBase : false;
              
              // Handle mouse enter/leave with delay
              const handleMouseEnter = () => {
                // Clear any pending close timeout
                if (isKnowledgeBase) {
                  if (knowledgeBaseTimeoutRef.current) clearTimeout(knowledgeBaseTimeoutRef.current);
                } else if (isMore) {
                  if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
                }
                setIsOpen(true);
              };

              const handleMouseLeave = () => {
                // Set a delay before closing
                const timeoutRef = isKnowledgeBase ? knowledgeBaseTimeoutRef : moreTimeoutRef;
                timeoutRef.current = setTimeout(() => {
                  setIsOpen(false);
                }, 300); // 300ms delay
              };

              return (
                <div 
                  key={item.name}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-center h-full px-3 lg:px-4
                      text-center text-sm font-semibold transition-all duration-200 ease-in-out
                      relative group whitespace-nowrap
                      ${isInSection ? 'text-white' : 'text-cyan-200 hover:text-white'}
                    `}
                  >
                    {item.name}
                    <FaChevronDown className="ml-1 text-xs" />
                    <span
                      className={`
                        absolute bottom-0 left-0 w-full h-1 bg-cyan-300 rounded-t-full
                        transition-all duration-300 ease-out transform
                        ${isInSection ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                      `}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {item.subItems?.map((subItem) => {
                        const isActive = pathname === subItem.href;
                        // Handle nested subItems (like Systemic Shifts within Knowledge Base)
                        if (subItem.subItems && subItem.subItems.length > 0) {
                          return (
                            <div key={subItem.name} className="relative group/nested">
                              <Link
                                href={subItem.href}
                                className={`
                                  block px-4 py-2 text-sm transition-colors
                                  ${isActive
                                    ? 'bg-teal-50 text-teal-700 font-semibold'
                                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                  }
                                `}
                              >
                                {subItem.name}
                              </Link>
                              {/* Nested dropdown */}
                              <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all z-50">
                                {subItem.subItems.map((nestedItem) => {
                                  const isNestedActive = pathname === nestedItem.href;
                                  return (
                                    <Link
                                      key={nestedItem.name}
                                      href={nestedItem.href}
                                      className={`
                                        block px-4 py-2 text-sm transition-colors
                                        ${isNestedActive
                                          ? 'bg-teal-50 text-teal-700 font-semibold'
                                          : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                        }
                                      `}
                                    >
                                      {nestedItem.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        // Regular subItem
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                              block px-4 py-2 text-sm transition-colors
                              ${isActive
                                ? 'bg-teal-50 text-teal-700 font-semibold'
                                : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                              }
                            `}
                            title={subItem.description}
                          >
                            <div>{subItem.name}</div>
                            {subItem.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{subItem.description}</div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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
            if (item.type === 'dropdown') {
              const isKnowledgeBase = item.name === 'Knowledge Base';
              const isMore = item.name === 'More';
              const isOpen = isKnowledgeBase ? isKnowledgeBaseOpen : (isMore ? isMoreOpen : false);
              const setIsOpen = isKnowledgeBase ? setIsKnowledgeBaseOpen : (isMore ? setIsMoreOpen : () => {});
              
              return (
                <div key={item.name} className="flex flex-col items-center gap-2 w-full">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-cyan-200 hover:text-white text-2xl font-semibold flex items-center gap-2"
                  >
                    {item.name}
                    <FaChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
                      {item.subItems?.map((subItem) => {
                        // Handle nested subItems
                        if (subItem.subItems && subItem.subItems.length > 0) {
                          return (
                            <div key={subItem.name} className="flex flex-col gap-2">
                              <Link
                                href={subItem.href}
                                onClick={handleLinkClick}
                                className="text-cyan-300 hover:text-white text-xl font-medium pl-4"
                              >
                                {subItem.name}
                              </Link>
                              <div className="flex flex-col gap-2 pl-8">
                                {subItem.subItems.map((nestedItem) => (
                                  <Link
                                    key={nestedItem.name}
                                    href={nestedItem.href}
                                    onClick={handleLinkClick}
                                    className="text-cyan-400 hover:text-white text-lg font-medium"
                                  >
                                    {nestedItem.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        // Regular subItem
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleLinkClick}
                            className="text-cyan-300 hover:text-white text-xl font-medium pl-4"
                          >
                            {subItem.name}
                            {subItem.description && (
                              <div className="text-sm text-cyan-400 mt-1">{subItem.description}</div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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
