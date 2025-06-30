"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ServiceCategory } from '@prisma/client';
import { specializations, categoryTitles } from '@/app/types/categories';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SelectedServices {
  [key: string]: string[];
}

export default function MasterProfileSetup() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});

  // Проверяем статус авторизации и роль пользователя
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      if (!session?.user?.role || session.user.role !== 'MASTER') {
        router.push('/');
        return;
      }
    }
  }, [status, session, router]);

  // Если сессия загружается, показываем загрузку
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Загрузка...</div>
      </div>
    );
  }

  const handleServiceToggle = (category: ServiceCategory, serviceId: string) => {
    setSelectedServices(prev => {
      const categoryServices = prev[category] || [];
      if (categoryServices.includes(serviceId)) {
        return {
          ...prev,
          [category]: categoryServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryServices, serviceId]
        };
      }
    });
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      alert('Необходимо войти в систему');
      router.push('/auth/login');
      return;
    }

    // Проверка: выбрана ли хотя бы одна специализация
    const services = Object.entries(selectedServices).reduce((acc, [category, specIds]) => {
      const categorySpecs = specializations[category as ServiceCategory];
      const specs = specIds.map(id => {
        const spec = categorySpecs.find(s => s.id === id);
        if (spec) {
          return {
            title: spec.title,
            category: category,
            specializationId: id
          };
        }
        return null;
      }).filter(Boolean);
      return [...acc, ...specs];
    }, [] as any[]);

    if (services.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну специализацию!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: services
        }),
        credentials: 'include' // Важно для отправки куки с сессией
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save services');
      }

      // Принудительно обновляем сессию, чтобы isSetupComplete стал true
      await update();

      // Используем window.location.href для полной перезагрузки и обхода кэша middleware
      window.location.href = `/profile/${session.user.id}`;
      
    } catch (error) {
      console.error('Error saving services:', error);
      alert('Произошла ошибка при сохранении услуг');
    } finally {
      setIsLoading(false);
    }
  };

  // Получаем отсортированный список категорий
  const sortedCategories = Object.entries(categoryTitles)
    .sort(([, a], [, b]) => a.localeCompare(b, 'ru'))
    .map(([category]) => category as ServiceCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-10 drop-shadow-lg tracking-tight">
          Настройка профиля мастера
        </h1>
        
        <div className="flex flex-col md:flex-row gap-10">
          {/* Категории */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
              <h2 className="font-semibold text-xl mb-6 text-blue-700 tracking-wide">Категории</h2>
              <ul className="space-y-3">
                {sortedCategories.map((category) => (
                  <li key={category}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-xl transition font-semibold border-2 text-base shadow-sm focus:outline-none duration-200 ${ 
                        category === selectedCategory 
                          ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-lg" 
                          : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:scale-105"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {categoryTitles[category]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Специализации */}
          <section className="flex-grow">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
              <h2 className="font-semibold text-xl mb-6 text-blue-700 tracking-wide">
                {selectedCategory ? `Специализации — ${categoryTitles[selectedCategory]}` : 'Выберите категорию'}
              </h2>

              {/* Выбранные специализации */}
              {selectedCategory && selectedServices[selectedCategory]?.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-3 animate-fade-in">
                  {selectedServices[selectedCategory].map((specId) => {
                    const spec = specializations[selectedCategory].find(s => s.id === specId);
                    if (!spec) return null;
                    return (
                      <span
                        key={specId}
                        className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-semibold gap-2 shadow-md animate-fade-in"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                        {spec.title}
                        <button
                          type="button"
                          className="ml-1 text-blue-400 hover:text-red-500 focus:outline-none"
                          onClick={() => handleServiceToggle(selectedCategory, specId)}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {selectedCategory && specializations[selectedCategory] && (
                <div className="flex flex-wrap gap-3">
                  {specializations[selectedCategory].map((spec) => {
                    const isSelected = selectedServices[selectedCategory]?.includes(spec.id);
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => handleServiceToggle(selectedCategory, spec.id)}
                        className={`px-5 py-3 rounded-full border-2 transition font-semibold text-base shadow-sm focus:outline-none duration-200 animate-fade-in ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-lg"
                            : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:scale-105"
                        }`}
                      >
                        {spec.title}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleSave}
                className="mt-10 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition flex items-center gap-2 mx-auto duration-200"
              >
                <CheckCircleIcon className="w-6 h-6" />
                Сохранить услуги
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 