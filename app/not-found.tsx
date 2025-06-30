import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          Страница не найдена
        </h3>
        <p className="text-gray-600 mb-8">
          Извините, но страница, которую вы ищете, не существует или была удалена.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Вернуться в избранное
        </Link>
      </div>
    </div>
  );
} 