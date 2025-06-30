import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Админ-панель</h1>
        {/* Здесь можно добавить имя администратора, выход и т.д. */}
      </header>
      <main className="p-4 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
} 