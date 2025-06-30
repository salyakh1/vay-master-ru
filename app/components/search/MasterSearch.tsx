'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ServiceCategory } from '@prisma/client';
import { MasterSearchForm } from './MasterSearchForm';
import { MasterList } from './MasterList';
import type { MasterWithDetails } from '@/app/types/master';

interface SearchParams {
  query: string;
  category: ServiceCategory | '';
  specialization: string;
  city: string;
  rating: number;
}

interface MasterSearchProps {
  categories: ServiceCategory[];
  initialMasters: MasterWithDetails[];
}

export function MasterSearch({ categories, initialMasters }: MasterSearchProps) {
  const [masters, setMasters] = useState<MasterWithDetails[]>(initialMasters);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    category: '',
    specialization: '',
    city: '',
    rating: 0,
  });

  const handleSearch = useCallback(async (params: SearchParams) => {
    // Не выполняем поиск, если строка поиска слишком короткая
    if (params.query.trim().length === 1) {
      return;
    }

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем только непустые параметры
      const trimmedQuery = params.query.trim();
      if (trimmedQuery) {
        queryParams.append('query', trimmedQuery);
      }
      if (params.category) {
        queryParams.append('category', params.category);
      }
      if (params.specialization) {
        queryParams.append('specialization', params.specialization);
      }
      if (params.city.trim()) {
        queryParams.append('city', params.city.trim());
      }
      if (params.rating > 0) {
        queryParams.append('rating', params.rating.toString());
      }

      const response = await fetch(`/api/search/masters?${queryParams}`);
      if (!response.ok) {
        throw new Error('Ошибка поиска');
      }
      const data = await response.json();
      setMasters(data);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Используем debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchParams);
    }, 300); // Задержка в 300мс для всех параметров кроме текстового поиска

    return () => clearTimeout(timer);
  }, [searchParams, handleSearch]);

  return (
    <div className="container mx-auto px-2 py-6">
      <h1 className="text-3xl font-bold mb-8">Поиск мастеров</h1>
      
      <div className="space-y-8">
        {/* Форма поиска и фильтры вынесена вне зависимости от masters */}
        <MasterSearchForm 
          categories={categories} 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          isLoading={isLoading}
        />

        {/* Список мастеров */}
        <div>
          <MasterList masters={masters} />
        </div>
      </div>
    </div>
  );
} 