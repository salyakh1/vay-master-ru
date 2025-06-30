'use client';

import { ExtendedUser } from '@/types/user';
import { categoryTitles, specializations } from '@/app/types/categories';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { ServiceCategory } from '@prisma/client';

interface Service {
  id: string;
  category: ServiceCategory;
  title: string;
}

interface SearchResultsProps {
  masters: ExtendedUser[];
}

export default function SearchResults({ masters }: SearchResultsProps) {
  if (masters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">По вашему запросу ничего не найдено</p>
      </div>
    );
  }

  // Функция для группировки услуг по категориям
  const groupServicesByCategory = (services: Service[]) => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<ServiceCategory, Service[]>);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {masters.map((master) => (
        <div
          key={master.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link href={`/profile/${master.id}`}>
            <div className="relative h-48">
              <Image
                src={master.avatar || '/images/default-avatar.png'}
                alt={master.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{master.name}</h3>
              <p className="text-gray-600 mb-2">{master.city}</p>
              
              {/* Специализации, сгруппированные по категориям */}
              {master.services && master.services.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-2">Специализации:</p>
                  {Object.entries(groupServicesByCategory(master.services as Service[])).map(([category, services]) => (
                    <div key={category} className="mb-2">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {categoryTitles[category as keyof typeof categoryTitles]}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {services.map((service) => (
                          <span
                            key={service.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {service.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Рейтинг */}
              <div className="flex items-center mt-2">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-gray-700">
                  {master.rating ? master.rating.toFixed(1) : 'Нет оценок'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
} 