'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceCategory } from '@prisma/client';
import { specializations, categoryTitles, Specialization } from '@/app/types/categories';

interface SearchParams {
  query: string;
  category: ServiceCategory | '';
  specialization: string;
  city: string;
  rating: number;
}

interface MasterSearchFormProps {
  categories: ServiceCategory[];
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  isLoading?: boolean;
}

export function MasterSearchForm({ categories, searchParams, setSearchParams, isLoading = false }: MasterSearchFormProps) {
  const [availableSpecializations, setAvailableSpecializations] = useState<Specialization[]>([]);
  const [localQuery, setLocalQuery] = useState(searchParams.query);

  // Обновляем специализации при изменении категории
  useEffect(() => {
    if (searchParams.category) {
      const categorySpecs = specializations[searchParams.category] || [];
      setAvailableSpecializations(categorySpecs);
    } else {
      setAvailableSpecializations([]);
    }
  }, [searchParams.category]);

  // Синхронизируем локальное значение с внешним при изменении searchParams
  useEffect(() => {
    setLocalQuery(searchParams.query);
  }, [searchParams.query]);

  // Используем debounce для обновления поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchParams.query) {
        setSearchParams(prev => ({ ...prev, query: localQuery }));
      }
    }, 500); // Задержка в 500мс

    return () => clearTimeout(timer);
  }, [localQuery, searchParams.query, setSearchParams]);

  // Обработчик для немедленного поиска по пробелу или Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchParams(prev => ({ ...prev, query: localQuery.trim() }));
    }
  };

  // Сортируем категории по русским названиям и фильтруем только те, что есть в categoryTitles и specializations
  const filteredCategories = categories.filter(
    (cat) => categoryTitles[cat] && specializations[cat]
  );
  const sortedCategories = [...filteredCategories].sort((a, b) => 
    categoryTitles[a].localeCompare(categoryTitles[b], 'ru')
  );

  // Для расширенной отладки
  useEffect(() => {
    console.log('--- ОТЛАДКА КАТЕГОРИЙ ---');
    console.log('categories (из пропса):', categories);
    console.log('categoryTitles (ключи):', Object.keys(categoryTitles));
    console.log('specializations (ключи):', Object.keys(specializations));
    console.log('filteredCategories:', filteredCategories);
    console.log('sortedCategories:', sortedCategories);
    console.log('Выбранная категория:', searchParams.category);
    console.log('--------------------------');
  }, [categories, filteredCategories, sortedCategories, searchParams.category]);

  return (
    <form className="w-full bg-white rounded-lg shadow-sm" onSubmit={e => e.preventDefault()}>
      <div className="p-4 space-y-4">
        {/* Верхняя панель с поиском */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Имя, категория или специализация мастера"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Категории (минимальный пример для диагностики) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              value={searchParams.category ? String(searchParams.category) : ''}
              onChange={(e) => {
                const value = e.target.value;
                console.log('onChange категории (минимальный пример), value:', value);
                setSearchParams((prev) => ({
                  ...prev,
                  category: value === '' ? '' : (value as ServiceCategory),
                  specialization: ''
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={String(category)} value={String(category)}>
                  {categoryTitles[category] || category}
                </option>
              ))}
            </select>
          </div>

          {/* Специализации */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Специализация
            </label>
            <select
              value={searchParams.specialization}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !searchParams.category}
            >
              <option value="">Все специализации</option>
              {availableSpecializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Город */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Город
            </label>
            <input
              type="text"
              value={searchParams.city}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="Введите город"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Рейтинг */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Минимальный рейтинг
            </label>
            <select
              value={searchParams.rating}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="0">Любой рейтинг</option>
              <option value="4">4+ звезды</option>
              <option value="4.5">4.5+ звезды</option>
              <option value="5">Только 5 звезд</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
} 