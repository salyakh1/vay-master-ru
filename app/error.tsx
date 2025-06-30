'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Что-то пошло не так
        </h2>
        <p className="text-gray-600 mb-6">
          Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте снова.
        </p>
        <button
          onClick={reset}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
} 