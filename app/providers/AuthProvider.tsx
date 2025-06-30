'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

const REFRESH_INTERVAL = 5 * 60; // 5 minutes in seconds

export function AuthProvider({ 
  children,
  refetchInterval = REFRESH_INTERVAL
}: { 
  children: React.ReactNode;
  refetchInterval?: number;
}) {
  useEffect(() => {
    const handleError = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error && event.reason.message.includes('auth')) {
        console.error('AuthProvider Error:', event.reason);
        // Здесь можно добавить обработку ошибок, например, отправку в сервис аналитики
      }
    };

    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <SessionProvider 
      refetchInterval={refetchInterval}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
} 