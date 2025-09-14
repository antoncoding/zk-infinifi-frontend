import './global.css';

import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics';
import { ClientProviders } from '@/components/providers/ClientProviders';
import OnchainProviders from '@/OnchainProviders';
import { Toaster } from 'react-hot-toast';

import { initAnalytics } from '@/utils/analytics';
import { ThemeProviders } from '../src/components/providers/ThemeProvider';
import { inter, zen, monospace } from './fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'http://localhost:3000'
  ),
  manifest: '/manifest.json',
  other: {
    boat: '0.17.0',
  },
};

// Start analytics before the App renders,
// so we can track page views and early events
initAnalytics();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${zen.variable} ${inter.variable} ${monospace.variable}`}>
      <body className={zen.className}>
        <ThemeProviders>
          <OnchainProviders>
            <ClientProviders>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                  error: {
                    style: {
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                    },
                    iconTheme: {
                      primary: '#dc2626',
                      secondary: '#fff',
                    },
                  },
                  success: {
                    style: {
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                    },
                    iconTheme: {
                      primary: '#16a34a',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </ClientProviders>
          </OnchainProviders>
        </ThemeProviders>
      </body>
      <GoogleAnalytics />
    </html>
  );
}
