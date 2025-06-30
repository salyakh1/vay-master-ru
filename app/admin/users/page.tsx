import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/user';
import AdminBackButton from '@/app/components/admin/AdminBackButton';
import dynamic from 'next/dynamic';
const UsersTable = dynamic(() => import('@/app/components/admin/UsersTable'), { ssr: false });

const roles = [
  { value: 'CLIENT', label: 'Клиент' },
  { value: 'MASTER', label: 'Мастер' },
  { value: 'SHOP', label: 'Магазин' },
  { value: 'ADMIN', label: 'Админ' },
];

async function deleteUser(userId: string) {
  'use server';
  await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
  revalidatePath('/admin/users');
}

export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string; role?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const q = searchParams?.q || '';
  const validRoles = roles.map(r => r.value);
  const role = searchParams?.role || '';

  const users = await prisma.user.findMany({
    where: {
      AND: [
        q ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ] } : {},
        validRoles.includes(role) ? { role: role as any } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center mb-6 gap-4">
        <AdminBackButton />
        <h2 className="text-2xl font-bold">Пользователи</h2>
      </div>
      <form className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени или email..."
          className="border rounded px-3 py-2 text-sm"
        />
        <select name="role" defaultValue={role} className="border rounded px-3 py-2 text-sm">
          <option value="">Все роли</option>
          {roles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Искать</button>
      </form>
      <UsersTable initialUsers={users} roles={roles} />
    </div>
  );
} 