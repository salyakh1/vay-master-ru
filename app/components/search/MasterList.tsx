'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import type { User } from '@prisma/client';

interface MasterWithDetails extends User {
  services: {
    id: string;
    title: string;
    category: string;
  }[];
  _count?: {
    followers: number;
    reviews: number;
  };
  firstName: string | null;
  lastName: string | null;
}

interface MasterListProps {
  masters: MasterWithDetails[];
}

export function MasterList({ masters }: MasterListProps) {
  return (
    <div className="max-w-5xl mx-auto px-2">
      {masters.length === 0 ? (
        <div className="text-center py-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-lg">
              Мастера не найдены. Попробуйте изменить параметры поиска.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {masters.map((master) => {
            const fullName = master.firstName || master.lastName 
              ? `${master.firstName || ''} ${master.lastName || ''}`.trim() 
              : master.name;
            
            return (
              <Link href={`/profile/${master.id}`} key={master.id} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  
                  {/* Аватар */}
                  <div className="relative w-full aspect-square">
                    {master.avatar ? (
                      <Image
                        src={master.avatar}
                        alt={fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                        {(fullName ? fullName[0] : '?').toUpperCase()}
                      </div>
                    )}
                     {/* Рейтинг */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-800 font-semibold">{master.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  {/* Блок с информацией */}
                  <div className="flex flex-col items-center text-center p-4 flex-grow">
                    {/* Имя и Фамилия */}
                    <h2 className="text-lg font-bold text-gray-800 mb-2 truncate w-full">{fullName}</h2>

                    {/* Специализации */}
                    {master.services && master.services.length > 0 && (
                      <div className="flex flex-col items-center gap-1 mb-3 flex-grow w-full">
                        {master.services.slice(0, 3).map(service => (
                          <span
                            key={service.id}
                            className="text-sm text-gray-600 truncate w-full text-left"
                          >
                            {service.title}
                          </span>
                        ))}
                        {master.services.length > 3 && (
                          <span className="text-sm text-gray-500 font-medium">
                            и еще {master.services.length - 3}...
                          </span>
                        )}
                      </div>
                    )}

                    {/* Контакты */}
                    <div className="mt-auto pt-4 border-t border-gray-100 w-full space-y-2">
                      {master.phone && (
                        <div className="flex items-center text-gray-600 whitespace-nowrap">
                          <FaPhone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{master.phone}</span>
                        </div>
                      )}
                      {master.city && (
                        <div className="flex items-center text-gray-600 whitespace-nowrap">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{master.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 