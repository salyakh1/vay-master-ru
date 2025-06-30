'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { specializations, categoryTitles } from '@/app/types/categories';
import { FaCamera, FaSave } from 'react-icons/fa';
import { MainNav } from '@/app/components/navigation/MainNav';
import { revalidatePath } from 'next/cache';
import ServiceManager from '@/app/components/profile/ServiceManager'
import type { Service } from '@/types/user'

async function updateProfile(formData: any) {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
}

export default function ProfileEdit() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    description: '',
    avatar: '',
    banner: '',
    services: [] as Service[],
    serviceArea: '',
    readyToTravel: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) return;
      const profile = await res.json();
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        city: profile.city || '',
        description: profile.description || '',
        avatar: profile.avatar || '',
        banner: profile.banner || '',
        services: profile.services || [],
        serviceArea: profile.serviceArea || '',
        readyToTravel: profile.readyToTravel || false,
      }));
    } catch (e) { console.error('Failed to fetch profile', e); }
  }, []);

  useEffect(() => {
    if (session?.user?.id && session.user.role === 'MASTER') {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, session?.user?.role, fetchProfile]);

  if (session?.user?.role !== 'MASTER') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center text-red-600 text-xl font-bold">
        Редактирование профиля доступно только для мастеров
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const name = (formData.firstName + ' ' + formData.lastName).trim();
      const result = await updateProfile({
        ...formData,
        name,
      });
      if (result.success) {
        await update();
        await fetchProfile(session.user.id);
        router.push('/profile');
      } else {
        alert(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        [type]: data.url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleServiceChange = async (services: Service[]) => {
    setFormData(prev => ({ ...prev, services }));
  };

  return (
    <>
      <MainNav />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">Редактирование профиля</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Изображения */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
              <span>Изображения</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Аватар</label>
                <div className="relative w-24 h-24 mb-2">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 shadow" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400 border-2 border-gray-200">
                      <FaCamera />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Загрузить аватар"
                  />
                </div>
                <span className="text-xs text-gray-400">PNG, JPG, WEBP до 5MB</span>
              </div>
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Баннер</label>
                <div className="relative w-full h-24 mb-2 rounded-xl overflow-hidden">
                  {formData.banner ? (
                    <img src={formData.banner} alt="Banner preview" className="w-full h-24 object-cover border-2 border-blue-200 shadow" />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-3xl text-gray-400 border-2 border-gray-200 rounded-xl">
                      <FaCamera />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Загрузить баннер"
                  />
                </div>
                <span className="text-xs text-gray-400">PNG, JPG, WEBP до 10MB</span>
              </div>
            </div>
          </div>
          {/* Основная информация */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
              <span>Основная информация</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg"
                  required
                  placeholder="Имя"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Фамилия</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg"
                  required
                  placeholder="Фамилия"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Город</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg"
                  required
                  placeholder="Ваш город"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Описание о себе</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg min-h-[60px]"
                  rows={3}
                  placeholder="Расскажите о себе..."
                />
              </div>
            </div>
          </div>
          {/* Услуги и специализация */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
              <span>Услуги и специализация</span>
            </h2>
            <div className="space-y-4">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Услуги (категории и специализации)</label>
                <ServiceManager
                  services={formData.services}
                  onChange={handleServiceChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Зона обслуживания</label>
                <input
                  type="text"
                  value={formData.serviceArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceArea: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 text-lg"
                  placeholder="Например: Москва, Санкт-Петербург"
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="readyToTravel"
                  checked={formData.readyToTravel}
                  onChange={(e) => setFormData(prev => ({ ...prev, readyToTravel: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="readyToTravel" className="ml-3 block text-md text-gray-900">
                  Готов к выезду в другие районы
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-8 py-3 text-white font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 