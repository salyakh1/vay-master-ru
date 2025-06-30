"use client";
import { useState } from "react";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";

export default function UsersTable({ initialUsers, roles }: { initialUsers: any[], roles: { value: string, label: string }[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm("Удалить пользователя?")) return;
    setLoadingId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    console.log('Удаление пользователя:', { status: res.status, data });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Ошибка при удалении пользователя: " + (data.error || res.status));
    }
    setLoadingId(null);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Имя</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Роль</th>
            <th className="p-3 text-left">Город</th>
            <th className="p-3 text-left">Дата регистрации</th>
            <th className="p-3 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-medium">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{roles.find(r => r.value === user.role)?.label || user.role}</td>
              <td className="p-3">{user.city}</td>
              <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="p-3 flex gap-2">
                <Link href={`/profile/${user.id}`} className="text-blue-600 hover:underline">Профиль</Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Удалить пользователя"
                  disabled={loadingId === user.id}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 