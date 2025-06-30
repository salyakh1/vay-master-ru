'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { FaArrowLeft, FaVideo, FaPhone, FaEllipsisV, FaPlus, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import type { FullChat } from '@/app/types/chat';
import type { Message, User } from '@prisma/client';
import { ConfirmationModal } from '@/app/components/ui/ConfirmationModal';

interface ChatWindowProps {
  chat: FullChat;
  onBack: () => void;
}

// We need a more detailed message type for optimistic updates
type OptimisticMessage = Message & {
  sender: Pick<User, 'id' | 'name' | 'avatar'>;
};

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const companion = chat.participants.find(p => p.user.id !== session?.user.id)?.user;

  useEffect(() => {
    // When the chat prop changes, update the messages
    setMessages(chat.messages);
  }, [chat.messages, chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user.id) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      chatId: chat.id,
      senderId: session.user.id,
      content: newMessage.trim(),
      createdAt: new Date(),
      read: false,
      // The message model in prisma doesn't have these, but let's keep them for type safety if the model changes
      // image: null,
      // updatedAt: new Date(),
    };

    // Optimistically update the UI
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      // Instead of full refresh, we could optionally replace the optimistic 
      // message with the real one returned from the server, or just rely on the next refresh/navigation.
      // For simplicity, we will still use router.refresh() to ensure data consistency
      // but the user will see their message instantly.
      router.refresh();

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Не удалось отправить сообщение');
      // Rollback optimistic update
      setMessages(prevMessages => prevMessages.filter(m => m.id !== optimisticId));
    }
  };

  const handleClearChat = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chat.id }),
      });

      if (!response.ok) throw new Error('Failed to clear chat');

      toast.success('Чат очищен');
      setMessages([]); // Clear messages locally
      router.refresh(); // To update the chat list as well
    } catch (error) {
      console.error(error);
      toast.error('Не удалось очистить чат');
    } finally {
      setIsConfirming(false);
      setIsModalOpen(false);
      setIsMenuOpen(false);
    }
  };
  
  if (!session) return <div className="flex h-full items-center justify-center">Загрузка сессии...</div>;

  if (!companion) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 text-gray-600 hover:text-blue-500 md:hidden">
          <FaArrowLeft />
        </button>
        <p>Выберите чат, чтобы начать общение.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center p-3 border-b bg-white shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 mr-2 rounded-md border border-blue-500 bg-white text-blue-500 hover:bg-blue-50 transition-colors md:hidden"
        >
          <FaArrowLeft />
        </button>
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image
            src={companion.avatar || '/default-avatar.png'}
            alt={companion.name || 'avatar'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{companion.name}</h2>
          <p className="text-sm text-gray-500">В сети</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 rounded-md border border-blue-500 bg-white text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FaEllipsisV />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => setIsModalOpen(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Очистить чат
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 max-w-[85%] ${
              message.senderId === session.user.id ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
             <div
              className={`px-4 py-2 rounded-2xl shadow-sm ${
                message.senderId === session.user.id
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none'
              }`}
            >
              {/* The Message model doesn't have an 'image' field, this might be a leftover from other functionality */}
              {/* {message.image && <img src={message.image} alt="uploaded content" className="mb-2 rounded-md max-w-xs" />} */}
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center p-2 bg-gray-100 border-t"
      >
        <button 
          type="button" 
          className="p-3 rounded-full border border-blue-500 bg-white text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <FaPlus />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ваше сообщение"
          className="flex-1 bg-transparent px-4 py-2 mx-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300"
          disabled={!newMessage.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearChat}
        title="Очистить историю чата?"
        message="Все сообщения в этом чате будут удалены навсегда. Это действие нельзя отменить."
        confirmText="Очистить"
        isConfirming={isConfirming}
      />
    </div>
  );
} 