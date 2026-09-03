import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { InstallAppBanner } from '../components/InstallAppBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IT Service Hub - Speed of Blinkit • Power of Amazon',
  description: 'Shop computer hardware, NVMe SSDs, CCTV security cameras, refurbished ThinkPads, and software services with 2-Hour Express Delivery in Ahilyanagar & MIDC.',
  keywords: ['IT Service Hub', 'Computer Hardware', 'CCTV Cameras', 'SSD Upgrade', 'Ahilyanagar MIDC', 'Refurbished Laptops'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IT Service Hub',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950`}>
        <CartProvider>
          {children}
          <InstallAppBanner />
        </CartProvider>
      </body>
    </html>
  );
}
