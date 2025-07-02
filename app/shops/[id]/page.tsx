"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '../../components/navigation/MainNav';
import { UserProfile } from '@/app/components/profile/UserProfile';

export default function ShopProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Профиль не найден');
          } else {
            throw new Error('Failed to fetch profile');
          }
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Произошла ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <UserProfile
          profile={profile}
          currentUser={session?.user ? {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            city: session.user.city
          } : null}
          isOwnProfile={session?.user?.id === params.id}
          onFollow={async () => {
            try {
              const response = await fetch(`/api/profile/${params.id}/follow`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              if (!response.ok) {
                throw new Error('Failed to toggle follow');
              }
              const updatedProfile = await response.json();
              setProfile(updatedProfile);
            } catch (err) {
              alert('Произошла ошибка при изменении подписки');
            }
          }}
        />
      </div>
    </>
  );
} 