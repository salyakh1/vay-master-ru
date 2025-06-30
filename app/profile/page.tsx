"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(`/profile/${session.user.id}`);
      }
    } else if (status === "unauthenticated") {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push("/auth/login");
    }
  }, [status, session, router]);

  // Показываем загрузку, пока происходит проверка сессии
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка профиля...</p>
      </div>
    </div>
  );
} 