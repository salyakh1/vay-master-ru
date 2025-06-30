'use client';

import { useState } from 'react';
import type { ServiceCategory } from '@prisma/client';
import type { Service } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { specializations, categoryTitles } from '@/app/types/categories';

interface ServiceManagerProps {
  services: Service[];
  onChange: (services: Service[]) => Promise<void>;
}

interface ValidationErrors {
  specializationId?: string;
  category?: string;
  description?: string;
}

const SERVICE_CATEGORIES = Object.entries(categoryTitles).map(([value, label]) => ({
  value: value as ServiceCategory,
  label
}));

export default function ServiceManager({ services, onChange }: ServiceManagerProps) {
  const [newService, setNewService] = useState<Partial<Service>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [availableSpecializations, setAvailableSpecializations] = useState<typeof specializations[ServiceCategory]>([]);

  const validateService = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!newService.specializationId?.trim()) {
      errors.specializationId = 'Выберите специализацию';
    }

    if (!newService.category) {
      errors.category = 'Выберите категорию';
    }

    if (newService.description && newService.description.length > 500) {
      errors.description = 'Описание не должно превышать 500 символов';
    }

    return errors;
  };

  const handleAddService = async () => {
    const validationErrors = validateService();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const selectedSpec = specializations[newService.category!]?.find(s => s.id === newService.specializationId);
        if (!selectedSpec) {
          throw new Error('Специализация не найдена');
        }

        const service: Service = {
          id: crypto.randomUUID(),
          title: selectedSpec.title,
          category: newService.category!,
          specializationId: newService.specializationId!,
          description: newService.description
        };
        await onChange([...services, service]);
        setNewService({});
        setAvailableSpecializations([]);
      } catch (error) {
        console.error('Failed to add service:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCategoryChange = (category: ServiceCategory) => {
    setNewService({ ...newService, category, specializationId: '' });
    setErrors({ ...errors, category: undefined });
    setAvailableSpecializations(specializations[category] || []);
  };

  const handleRemoveService = async (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      setIsSubmitting(true);
      try {
        await onChange(services.filter(s => s.id !== serviceToDelete.id));
      } catch (error) {
        console.error('Failed to remove service:', error);
      } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center space-x-4 rounded-lg border p-4 bg-white"
          >
            <div className="flex-grow">
              <h4 className="font-medium">{service.title}</h4>
              <p className="text-sm text-gray-500">{service.description}</p>
              <div className="mt-1">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
                  {categoryTitles[service.category]}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveService(service)}
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Удалить
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="rounded-lg border p-4 bg-white">
        <h4 className="mb-4 font-medium">Добавить услугу</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <select
              value={newService.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
              className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Выберите категорию</option>
              {SERVICE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {newService.category && (
            <div>
              <select
                value={newService.specializationId || ''}
                onChange={(e) => {
                  setNewService({ ...newService, specializationId: e.target.value });
                  setErrors({ ...errors, specializationId: undefined });
                }}
                className={`w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.specializationId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Выберите специализацию</option>
                {availableSpecializations.map(spec => (
                  <option key={spec.id} value={spec.id}>
                    {spec.title}
                  </option>
                ))}
              </select>
              {errors.specializationId && (
                <p className="mt-1 text-sm text-red-500">{errors.specializationId}</p>
              )}
            </div>
          )}

          <div>
            <textarea
              placeholder="Описание услуги"
              value={newService.description || ''}
              onChange={(e) => {
                setNewService({ ...newService, description: e.target.value });
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

          <button
            type="button"
            onClick={handleAddService}
            disabled={isSubmitting || !newService.specializationId || !newService.category}
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
              Вы уверены, что хотите удалить услугу "{serviceToDelete?.title}"?
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