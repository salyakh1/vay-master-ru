'use client';

import { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { FaImage, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; images: File[] }) => Promise<void>;
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Создаем URL для предпросмотра
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]); // Освобождаем URL
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await onSubmit({ content, images: selectedImages });
      setContent('');
      setSelectedImages([]);
      setPreviewUrls([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Ошибка при создании публикации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Затемнение фона */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Центрирование модального окна */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold">
                Создать публикацию
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Что у вас нового?"
                className="w-full h-32 p-3 border rounded-lg resize-none mb-4"
                required
              />

              {/* Предпросмотр изображений */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <FaImage />
                  Добавить фото
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Публикация...' : 'Опубликовать'}
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 