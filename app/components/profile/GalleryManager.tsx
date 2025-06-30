'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/types/user';

interface GalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function GalleryManager({ images, onChange }: GalleryManagerProps) {
  const [newImage, setNewImage] = useState<Partial<GalleryImage>>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // В реальном приложении здесь будет загрузка на сервер
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      const image: GalleryImage = {
        id: Math.random().toString(), // Временный ID
        url: imageUrl,
        title: newImage.title || '',
        description: newImage.description || '',
        createdAt: new Date()
      };
      
      onChange([...images, image]);
      setNewImage({});
    }
  };

  const handleRemoveImage = (id: string) => {
    onChange(images.filter(image => image.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square">
            <Image
              src={image.url}
              alt={image.title || ''}
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(image.id)}
              className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
            >
              ✕
            </button>
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                {image.title && <div className="font-medium">{image.title}</div>}
                {image.description && <div className="text-sm">{image.description}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Добавить изображение</h4>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Название работы"
            value={newImage.title || ''}
            onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Описание работы"
            value={newImage.description || ''}
            onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
            rows={3}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
} 