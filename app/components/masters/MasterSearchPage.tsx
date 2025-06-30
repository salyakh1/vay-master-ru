import React from 'react';
import { MasterSearch } from '../search/MasterSearch';
import SearchPageHeader from '../ui/SearchPageHeader';
import { MainNav } from '../navigation/MainNav';
import { prisma } from '@/lib/prisma';
import { ServiceCategory } from '@prisma/client';

async function getInitialData() {
  const masters = await prisma.user.findMany({
    where: {
      role: 'MASTER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      city: true,
      phone: true,
      description: true,
      avatar: true,
      rating: true,
      services: true,
      socialLinks: true,
    },
    orderBy: [
      { rating: 'desc' },
      { name: 'asc' },
    ],
  });

  return {
    masters,
    categories: Object.values(ServiceCategory)
  };
}

export default async function MasterSearchPage() {
  const { masters, categories } = await getInitialData();

  return (
    <>
      <MainNav />
      <div className="min-h-screen bg-gray-50">
        <SearchPageHeader 
          title="Поиск мастеров" 
          subtitle="Найдите подходящего мастера для ваших задач" 
        />
        <div className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white text-center py-6 mb-6 shadow-xl animate-fade-in">
          <span className="text-xl md:text-2xl font-bold drop-shadow-lg">🔥 Разместите рекламу вашего бизнеса здесь и привлеките новых клиентов!</span>
        </div>
        <div className="container mx-auto px-4">
              <MasterSearch 
                categories={categories}
                initialMasters={masters}
              />
        </div>
      </div>
    </>
  );
} 