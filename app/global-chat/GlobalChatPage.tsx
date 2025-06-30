'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaPaperPlane, FaUserShield, FaUserTie, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import type { GlobalChatMessage, User, UserRole } from '@prisma/client';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { MainNav } from '../components/navigation/MainNav';

type MessageWithSender = GlobalChatMessage & {
  sender: Pick<User, 'id' | 'name' | 'avatar' | 'role'> & {
    firstName?: string | null;
    lastName?: string | null;
  };
};

interface GlobalChatPageProps {
  initialMessages: MessageWithSender[];
  session: Session;
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleStyles = {
    MASTER: 'bg-blue-100 text-blue-800',
    CLIENT: 'bg-green-100 text-green-800',
    ADMIN: 'bg-red-100 text-red-800',
  };
  const roleText = {
    MASTER: 'Мастер',
    CLIENT: 'Клиент',
    ADMIN: 'Админ',
  };
  const Icon = {
    MASTER: FaUserTie,
    CLIENT: FaUserTie,
    ADMIN: FaUserShield,
  };
  const RoleIcon = Icon[role];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleStyles[role]}`}
    >
      <RoleIcon className="mr-1" />
      {roleText[role]}
    </span>
  );
};

export default function GlobalChatPage({
  initialMessages,
  session,
}: GlobalChatPageProps) {
  const [messages, setMessages] =
    useState<MessageWithSender[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/global-chat');
        if (response.ok) {
          const newMessages: MessageWithSender[] = await response.json();
          // A simple length check is enough to decide whether to update.
          if (newMessages.length > messages.length) {
            setMessages(newMessages);
          }
        }
      } catch (error) {
        console.error('Failed to fetch new messages', error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage: MessageWithSender = {
      id: tempId,
      content: newMessage.trim(),
      createdAt: new Date(),
      senderId: session.user.id,
      sender: {
        id: session.user.id,
        name: session.user.name ?? 'Вы',
        avatar: session.user.avatar ?? null,
        role: session.user.role as UserRole,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const response = await fetch('/api/global-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const savedMessage: MessageWithSender = await response.json();

      // Replace optimistic message with the real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Не удалось отправить сообщение.');
      // Rollback
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-10 h-20 p-4 bg-white/80 backdrop-blur-lg border-b border-gray-200/30">
        <div className="relative flex items-center justify-center h-full">
            <Link href="/" className="absolute left-0 text-gray-600 hover:text-gray-800">
                <FaArrowLeft size={20} />
            </Link>
            <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800">Общий чат</h1>
                <p className="text-xs text-gray-500">Место для общения всего сообщества</p>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pt-24 pb-36 md:pb-4">
        {messages.map((message) => {
          const isMe = message.senderId === session.user.id;
          const fullName =
            `${message.sender.firstName || ''} ${
              message.sender.lastName || ''
            }`.trim() || message.sender.name;

          return (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <Link
                href={`/profile/${message.sender.id}`}
                className="flex-shrink-0"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                  <Image
                    src={message.sender.avatar || '/default-avatar.png'}
                    alt={fullName ?? 'Аватар'}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className={`p-3 rounded-xl max-w-md ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${message.sender.id}`}>
                    <span className="font-bold text-sm cursor-pointer hover:underline">{fullName}</span>
                  </Link>
                  <RoleBadge role={message.sender.role} />
                </div>
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-4 border-t fixed bottom-16 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            <FaPaperPlane />
          </button>
        </form>
      </footer>
      <div className="md:hidden">
        <MainNav />
      </div>
    </div>
  );
} 