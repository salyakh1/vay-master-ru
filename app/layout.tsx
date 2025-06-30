'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from './providers/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=375, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
} 