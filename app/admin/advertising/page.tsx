import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function AdvertisingPage() {
  // Получаем все баннеры, включая мобильные
  const banners = await prisma.banner.findMany({
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Управление рекламой</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">
              {banner.mobileOnly ? `Мобильный баннер ${banner.position - 5}` : `Баннер ${banner.position}`}
            </h2>
            {banner.image && (
              <div className="relative h-40 w-full mb-4">
                <Image
                  src={banner.image}
                  alt={banner.title || 'Рекламный баннер'}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <p className="text-gray-600 mb-2">{banner.title || 'Нет заголовка'}</p>
            <p className="text-gray-500 mb-2">{banner.link || 'Нет ссылки'}</p>
            <p className="text-sm text-gray-400">Статус: {banner.active ? 'Активен' : 'Неактивен'}</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Редактировать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 