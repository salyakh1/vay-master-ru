import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-4">Добро пожаловать в админ-панель!</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Пользователи</span>
        </Link>
        <Link href="/admin/masters" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Мастера</span>
        </Link>
        <Link href="/admin/shops" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Магазины</span>
        </Link>
        <Link href="/admin/posts" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Публикации</span>
        </Link>
        <Link href="/admin/reports" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Жалобы и модерация</span>
        </Link>
        <Link href="/admin/analytics" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Аналитика</span>
        </Link>
        <Link href="/admin/ads" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <span className="font-semibold text-lg">Реклама</span>
        </Link>
      </div>
    </div>
  );
} 