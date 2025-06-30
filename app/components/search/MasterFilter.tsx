'use client';

import { useState, useEffect } from 'react';
import { ServiceCategory } from '@prisma/client';
import { categoryTitles, specializations } from '@/app/types/categories';

interface MasterFilterProps {
  onFilterChange: (filters: {
    category: ServiceCategory | '';
    specialization: string;
    city: string;
    rating: string;
  }) => void;
}

export default function MasterFilter({ onFilterChange }: MasterFilterProps) {
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState('any');

  // Получаем отсортированный список категорий
  const sortedCategories = Object.entries(categoryTitles)
    .sort(([, a], [, b]) => a.localeCompare(b, 'ru'))
    .map(([key]) => key as ServiceCategory);

  // Получаем список специализаций для выбранной категории
  const currentSpecializations = category ? specializations[category] : [];

  // Обработчик изменения категории
  const handleCategoryChange = (newCategory: ServiceCategory | '') => {
    setCategory(newCategory);
    setSpecialization(''); // Сбрасываем специализацию при смене категории
    
    // Запускаем поиск с новыми параметрами
    onFilterChange({
      category: newCategory,
      specialization: '',
      city,
      rating
    });
  };

  // Обработчик изменения специализации
  const handleSpecializationChange = (newSpecialization: string) => {
    setSpecialization(newSpecialization);
    onFilterChange({
      category,
      specialization: newSpecialization,
      city,
      rating
    });
  };

  // Обработчик изменения города
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    onFilterChange({
      category,
      specialization,
      city: newCity,
      rating
    });
  };

  // Обработчик изменения рейтинга
  const handleRatingChange = (newRating: string) => {
    setRating(newRating);
    onFilterChange({
      category,
      specialization,
      city,
      rating: newRating
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Категория */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory | '')}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            {sortedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryTitles[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Специализация */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Специализация
          </label>
          <select
            value={specialization}
            onChange={(e) => handleSpecializationChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={!category}
          >
            <option value="">Все специализации</option>
            {currentSpecializations.map((spec) => (
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
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Введите город"
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Рейтинг */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Минимальный рейтинг
          </label>
          <select
            value={rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="any">Любой рейтинг</option>
            <option value="4">4+ звезды</option>
            <option value="4.5">4.5+ звезды</option>
            <option value="5">Только 5 звезд</option>
          </select>
        </div>
      </div>

      {/* Кнопка поиска */}
      <div className="flex justify-end">
        <button
          onClick={() => onFilterChange({ category, specialization, city, rating })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Найти
        </button>
      </div>
    </div>
  );
} 