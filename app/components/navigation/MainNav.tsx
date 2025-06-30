"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt, FaHeart, FaEdit, FaSearch, FaHome, FaComments } from 'react-icons/fa';

export function MainNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  console.log('SESSION В MAINNAV:', session);

  return (
    <>
      {/* Десктопное меню */}
      <nav className="hidden md:flex items-center h-16 px-4 bg-white border-b border-gray-200 z-30">
        <div className="flex justify-between h-16 items-center">
          {/* Левая часть: логотип и меню */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Vay Master</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/search/masters"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/search/masters')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Мастера
              </Link>
            </div>
          </div>

          {/* Правая часть: профиль и действия */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <Link
                  href="/chat"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/chat')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Чаты
                </Link>
                <Link
                  href="/favorites"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/favorites')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Публикации
                </Link>
              </>
            )}

            {/* Профиль */}
            <div className="relative">
              {session?.user ? (
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {session.user.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt={(session.user as any)?.firstName || (session.user as any)?.lastName ? `${(session.user as any)?.firstName || ''} ${(session.user as any)?.lastName || ''}`.trim() : (session.user.name || 'User')}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-500" />
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Войти
                </Link>
              )}

              {/* Выпадающее меню профиля */}
              {isProfileMenuOpen && session?.user && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaUser className="inline-block mr-2" />
                      Профиль
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaEdit className="inline-block mr-2" />
                      Редактировать
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline-block mr-2" />
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/50 backdrop-blur-lg border-t border-gray-200/30 md:hidden shadow-t-lg h-16 flex justify-center">
        <div className="max-w-md w-full flex h-16">
          <Link href="/" className={`flex-1 min-w-0 flex flex-col items-center justify-center text-[10px] transition-colors ${isActive('/') ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'} font-medium`}>
            <FaHome className="w-5 h-5 mb-0.5" />
            Главная
          </Link>
          <Link href="/search/masters" className={`flex-1 min-w-0 flex flex-col items-center justify-center text-[10px] transition-colors ${isActive('/search/masters') ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'} font-medium`}>
            <FaSearch className="w-5 h-5 mb-0.5" />
            Мастера
          </Link>
          {session?.user && (
            <Link href="/chat" className={`flex-1 min-w-0 flex flex-col items-center justify-center text-[10px] transition-colors ${isActive('/chat') ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'} font-medium`}>
              <FaComments className="w-5 h-5 mb-0.5" />
              Чаты
            </Link>
          )}
          <Link href="/favorites" className={`flex-1 min-w-0 flex flex-col items-center justify-center text-[10px] transition-colors ${isActive('/favorites') ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'} font-medium`}>
            <FaHeart className="w-5 h-5 mb-0.5" />
            Публикации
          </Link>
          <Link href={session?.user ? (session.user.role === 'ADMIN' ? '/admin' : `/profile/${session.user.id}`) : '/auth/login'} className={`flex-1 min-w-0 flex flex-col items-center justify-center text-[10px] transition-colors ${isActive(session?.user ? (session.user.role === 'ADMIN' ? '/admin' : `/profile/${session.user.id}`) : '/auth/login') ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'} font-medium`}>
            <FaUser className="w-5 h-5 mb-0.5" />
            {session?.user?.role === 'ADMIN' ? 'Админ' : 'Профиль'}
          </Link>
        </div>
      </nav>
    </>
  );
} 