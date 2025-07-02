import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';
import type { ServiceCategory } from '@/types/user';
import { categories } from '@/types/categories';

interface SearchFiltersProps {
  params: {
    city?: string;
    category?: ServiceCategory;
    service?: string;
    readyToTravel?: boolean;
    keyword?: string;
    clientCity?: string;
  };
  onFilterChange: (params: any) => void;
  categories: ServiceCategory[];
}

export default function SearchFilters({ params, onFilterChange, categories: availableCategories }: SearchFiltersProps) {
  const router = useRouter();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(params.category);
  const [selectedService, setSelectedService] = useState<string | undefined>(params.service);

  const handleCategoryChange = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedService(undefined);
    onFilterChange({ category, service: undefined });
  };

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
    onFilterChange({ service });
  };

  const handleCityChange = (city: string) => {
    onFilterChange({ city });
  };

  const handleReadyToTravelChange = (readyToTravel: boolean) => {
    onFilterChange({ readyToTravel });
  };

  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ keyword });
  };

  const handleClientCityChange = (clientCity: string) => {
    onFilterChange({ clientCity });
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedService(undefined);
    onFilterChange({
      category: undefined,
      service: undefined,
      city: undefined,
      readyToTravel: undefined,
      keyword: undefined,
      clientCity: undefined
    });
  };

  const selectedCategoryData = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const services = selectedCategoryData?.services || [];

  return (
    <div className="space-y-4">
      {/* Поисковая строка */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск мастеров..."
          value={params.keyword || ''}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Кнопка фильтров */}
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
      >
        <span>Фильтры</span>
        <span className="text-gray-500">
          {isFiltersOpen ? 'Скрыть' : 'Показать'}
        </span>
      </button>

      {/* Панель фильтров */}
      {isFiltersOpen && (
        <div className="space-y-4 rounded-lg border border-gray-300 bg-white p-4">
          {/* Категории */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Категория
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((category) => {
                const categoryData = categories.find(c => c.id === category);
                if (!categoryData) return null;
                
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`rounded-lg border p-2 text-sm ${
                      selectedCategory === category
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {categoryData.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Специальности */}
          {selectedCategory && services.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Специальность
              </label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.id)}
                    className={`rounded-lg border p-2 text-sm ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {service.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Город */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Город
            </label>
            <div className="relative">
              <input
                type="text"
                value={params.city || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="Введите город"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none"
              />
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Готовность к выезду */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Готовность к выезду
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={params.readyToTravel === true}
                  onChange={() => handleReadyToTravelChange(true)}
                  className="mr-2"
                />
                <span className="text-sm">Готов выехать</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={params.readyToTravel === false}
                  onChange={() => handleReadyToTravelChange(false)}
                  className="mr-2"
                />
                <span className="text-sm">Только в своем городе</span>
              </label>
            </div>
          </div>

          {/* Город клиента */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Город клиента
            </label>
            <div className="relative">
              <input
                type="text"
                value={params.clientCity || ''}
                onChange={(e) => handleClientCityChange(e.target.value)}
                placeholder="Введите город клиента"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none"
              />
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <button
            onClick={clearFilters}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            <span>Сбросить фильтры</span>
          </button>
        </div>
      )}
    </div>
  );
} 