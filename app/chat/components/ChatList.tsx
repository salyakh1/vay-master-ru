'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { FullChat } from '@/app/types/chat';

interface ChatListProps {
  onSelectChat: (chat: FullChat) => void;
  initialChatId: string | null;
}

export default function ChatList({ onSelectChat, initialChatId }: ChatListProps) {
  const [chats, setChats] = useState<FullChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
    fetchChats();
    }
  }, [session]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat');
      const data: FullChat[] = await response.json();
      setChats(data);
      
      if (initialChatId) {
        const chatToSelect = data.find(chat => chat.id === initialChatId);
        if (chatToSelect) {
          onSelectChat(chatToSelect);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Загрузка чатов...</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-2 flex flex-col">
      <div className="px-4 py-3 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-900">Сообщения</h2>
      </div>
      {chats.length === 0 ? (
        <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
          У вас пока нет чатов
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(p => p.user.id !== session?.user?.id)?.user;
            const lastMessage = chat.messages[0];
            const displayName = otherParticipant?.name || 'Пользователь';
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  {otherParticipant?.avatar ? (
                    <Image
                      src={otherParticipant.avatar}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-semibold">
                        {displayName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-semibold truncate text-gray-900">
                      {displayName}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 