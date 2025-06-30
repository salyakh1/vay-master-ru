'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductCategory } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';

interface ProductManagerProps {
  products: Product[];
  onChange: (products: Product[]) => Promise<void>;
  shopId: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'BUILDING_MATERIALS', label: 'Стройматериалы' },
  { value: 'AUTO_PARTS', label: 'Автозапчасти' },
  { value: 'HOUSEHOLD', label: 'Хозтовары' },
  { value: 'TOOLS', label: 'Инструменты' },
  { value: 'PLUMBING', label: 'Сантехника' },
  { value: 'ELECTRICAL', label: 'Электротовары' },
  { value: 'PAINT', label: 'Краски и покрытия' },
  { value: 'GARDEN', label: 'Товары для сада' },
  { value: 'OTHER', label: 'Другое' }
];

interface ValidationErrors {
  name?: string;
  image?: string;
  price?: string;
  category?: string;
  description?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductManager({ products, onChange, shopId, onImageUpload }: ProductManagerProps) {
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    available: true,
    shopId
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateProduct = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!newProduct.name?.trim()) {
      errors.name = 'Название товара обязательно';
    } else if (newProduct.name.length < 3) {
      errors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!newProduct.image) {
      errors.image = 'Изображение обязательно';
    }

    if (newProduct.price !== undefined) {
      if (newProduct.price < 0) {
        errors.price = 'Цена не может быть отрицательной';
      }
      if (newProduct.price > 1000000) {
        errors.price = 'Цена не может превышать 1 000 000 ₽';
      }
    }

    if (!newProduct.category) {
      errors.category = 'Выберите категорию';
    }

    if (newProduct.description && newProduct.description.length > 500) {
      errors.description = 'Описание не должно превышать 500 символов';
    }

    return errors;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Поддерживаются только форматы JPEG, PNG и WebP');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      let imageUrl;
      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
      } else {
        imageUrl = URL.createObjectURL(file);
      }
      setNewProduct({ ...newProduct, image: imageUrl });
      setErrors({ ...errors, image: undefined });
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadError('Не удалось загрузить изображение');
    }
  };

  const handleAddProduct = async () => {
    const validationErrors = validateProduct();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const product: Product = {
          id: crypto.randomUUID(),
          name: newProduct.name!,
          image: newProduct.image!,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          available: true,
          shopId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await onChange([...products, product]);
        setNewProduct({ available: true, shopId });
      } catch (error) {
        console.error('Failed to add product:', error);
        // Здесь можно добавить toast уведомление
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemoveProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsSubmitting(true);
      try {
        await onChange(products.filter(p => p.id !== productToDelete.id));
      } catch (error) {
        console.error('Failed to remove product:', error);
        // Здесь можно добавить toast уведомление
      } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const handleToggleAvailability = async (id: string) => {
    setIsSubmitting(true);
    try {
      await onChange(
        products.map(product =>
          product.id === id
            ? { ...product, available: !product.available }
            : product
        )
      );
    } catch (error) {
      console.error('Failed to update product availability:', error);
      // Здесь можно добавить toast уведомление
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg border p-4 bg-white"
          >
            <div className="flex items-start space-x-4">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-product.png';
                  }}
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {product.price !== undefined && (
                    <span className="text-lg font-medium">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                  {product.category && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      {PRODUCT_CATEGORIES.find(cat => cat.value === product.category)?.label}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(product.id)}
                    disabled={isSubmitting}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      product.available
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } disabled:opacity-50`}
                  >
                    {product.available ? 'В наличии' : 'Нет в наличии'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProduct(product)}
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="rounded-lg border p-4 bg-white">
        <h4 className="mb-4 font-medium">Добавить товар</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex items-center space-x-4">
              {newProduct.image && (
                <div className="relative h-20 w-20">
                  <Image
                    src={newProduct.image}
                    alt="Preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className={`w-full rounded-md border px-3 py-2 ${
                    errors.image || uploadError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {(errors.image || uploadError) && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.image || uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Название товара"
              value={newProduct.name || ''}
              onChange={(e) => {
                setNewProduct({ ...newProduct, name: e.target.value });
                setErrors({ ...errors, name: undefined });
              }}
              className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Описание"
              value={newProduct.description || ''}
              onChange={(e) => {
                setNewProduct({ ...newProduct, description: e.target.value });
                setErrors({ ...errors, description: undefined });
              }}
              rows={3}
              className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Цена"
                value={newProduct.price || ''}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) });
                  setErrors({ ...errors, price: undefined });
                }}
                className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div>
              <select
                value={newProduct.category || ''}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, category: e.target.value as ProductCategory });
                  setErrors({ ...errors, category: undefined });
                }}
                className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Выберите категорию</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            disabled={isSubmitting || !newProduct.name || !newProduct.image}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Подтверждение удаления
            </Dialog.Title>

            <p className="mb-4">
              Вы уверены, что хотите удалить товар "{productToDelete?.name}"?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 