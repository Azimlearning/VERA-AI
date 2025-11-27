// src/app/layout.js
'use client'; // <-- Must be a client component
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Inter } from 'next/font/google';
import MiniChatWidget from '../components/MiniChatWidget';
import { usePathname } from 'next/navigation'; // <-- Must import this

// Load Inter font with weights 300, 400, 500, 600
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata has been removed as this is now a Client Component.
// For SEO, it should be handled in a parent server component layout.

export default function RootLayout({ children }) {
  const pathname = usePathname();
  // Don't show the mini chat widget if we're on the main Vera page
  const showMiniChat = !pathname.startsWith('/vera');

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        {/* This logic hides the widget on the main chat page */}
        {showMiniChat && <MiniChatWidget />}
      </body>
    </html>
  );
}
