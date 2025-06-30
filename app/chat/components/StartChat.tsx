'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StartChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const startChat = async () => {
      if (!userId) return;

      try {
        // Создаем или получаем существующий чат
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otherUserId: userId,
          }),
        });

        const chat = await response.json();
        
        // Перенаправляем на страницу чата
        router.push(`/chat?chatId=${chat.id}`);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    };

    startChat();
  }, [userId, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Открываем чат...</p>
      </div>
    </div>
  );
} 