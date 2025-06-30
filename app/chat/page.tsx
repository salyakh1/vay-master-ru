'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import StartChat from './components/StartChat';
import { MainNav } from '@/app/components/navigation/MainNav';
import { FullChat } from '@/app/types/chat';

function ChatPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<FullChat | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const initialChatId = searchParams.get('id');

  const handleChatSelection = (chat: FullChat | null) => {
    setSelectedChat(chat);
  };
  
  const handleBack = () => {
    setSelectedChat(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return null;
  }
  
  if (isMobile) {
    return (
      <>
        <MainNav />
        <div className="container mx-auto p-0 h-[calc(100vh-64px)]">
          {!selectedChat ? (
            <ChatList onSelectChat={handleChatSelection} initialChatId={initialChatId} />
          ) : (
            <ChatWindow chat={selectedChat} onBack={handleBack} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <MainNav />
      <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md h-full">
            <ChatList onSelectChat={handleChatSelection} initialChatId={initialChatId} />
          </div>
          <div className="md:col-span-2 bg-white rounded-lg shadow-md h-full">
            {selectedChat ? <ChatWindow chat={selectedChat} onBack={handleBack} /> : <StartChat />}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ChatPageContent />
    </Suspense>
  );
} 