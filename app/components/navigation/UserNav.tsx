'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

export function UserNav() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 hover:opacity-80"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          {((session.user as any)?.firstName ? (session.user as any).firstName[0] : (session.user?.name ? session.user.name[0] : 'U')).toUpperCase()}
        </div>
        <span className="text-gray-700">{(session.user as any)?.firstName || (session.user as any)?.lastName ? `${(session.user as any)?.firstName || ''} ${(session.user as any)?.lastName || ''}`.trim() : session.user?.name}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              Профиль
            </Link>
            <Link
              href="/profile/edit"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaEdit className="w-4 h-4" />
              Редактировать профиль
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 