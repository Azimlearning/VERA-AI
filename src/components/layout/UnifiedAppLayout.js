"use client";

import ChatHistorySidebar from "../chat/ChatHistorySidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import VeraLogo from "../brand/VeraLogo";

export default function UnifiedAppLayout({ 
  children, 
  onNewChat = () => {}, 
  onLoadSession = () => {}, 
  currentSessionId = null, 
  selectedAgent = null 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 1. PERSISTENT SIDEBAR */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50 h-full w-64`}>
        <ChatHistorySidebar 
          onNewChat={onNewChat}
          onLoadSession={onLoadSession}
          currentSessionId={currentSessionId}
          selectedAgent={selectedAgent}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT AREA (Swappable Views) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Mobile Toggle (Only visible on small screens) */}
        <div className="md:hidden p-4 border-b flex items-center justify-between bg-white z-30">
          <VeraLogo 
            size="small" 
            showText={true} 
            variant="hero"
            onClick={() => router.push('/')}
          />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>

        {/* This is where Dashboard / Chat / Agents renders */}
        <div className="flex-1 overflow-auto bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}

